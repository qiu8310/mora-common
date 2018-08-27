import * as fs from 'fs'
import * as path from 'path'

import * as config from './config'
import * as fn from './fn'

export interface IFileCompileOptions {
  /** 文件的内容，避免重复读取 */
  content?: string

  /**
   * 因为有些会对 import 过来的变量处理下，所以所以有时可能需要开启此选项
   */
  disableAnalyzeImport?: boolean

  /**
   * 不使用 cache，每次都重新 compile
   */
  disableCache?: boolean

  /**
   * 指定缓存对象，方便引用。默认使用全局的 File.cache
   */
  cache?: {[key: string]: File}
}

export interface IFileImportKey {
  /**
   * import {a as c} from 中的 a
   */
  ref?: string
  from: string
  isAll?: boolean
  isDefault?: boolean
}

export interface IFileExportKey {
  from: string

  /**
   * ```
   *  export {a as c} from file // ref 为 a
   * ```
   * 或者
   * ```
   *  import a from file
   *  export {a as c}           // ref 应为 default
   */
  ref?: string
}

export class File {
  static cache: {[key: string]: File} = {}
  static compile(file: string, options: IFileCompileOptions = {}): File {
    file = path.resolve(file)

    let cache = options.cache || File.cache
    if (options.disableCache || !cache[file]) {
      cache[file] = new File(file, options.content).compile(options)
    }
    return cache[file]
  }

  src: string
  content: string

  imports: {[key: string]: IFileImportKey} = {}

  declares: string[] = []
  exports: {[key: string]: IFileExportKey} = {}

  /** 当内容中出现了 export = xxx，此值为 true；此字段主要给 indexify 程序用 */
  oldJsExport: boolean = false

  constructor(src: string, content?: string) {
    this.src = src
    this.content = (content == null ? fs.readFileSync(src).toString() : content)
      .replace(config.exportNamespaceRegExp, '') // 清除 namespace 的定义
  }

  compile(options: IFileCompileOptions = {}) {
    if (!options.disableAnalyzeImport) this.analyzeImport(options)
    this.analyzeExport(options)
    return this
  }

  //#region analyzeExport
  stringifyExportKey(obj: IFileExportKey) {
    let from = obj.from.replace(/(\.d)?\.tsx?$/, '').replace(/\/index$/, '/')
    return (from + (obj.ref ? config.KEY_SEPARATOR + obj.ref : '')).replace(/\\/, '/')
  }

  private _addExportKey(key: string, obj: IFileExportKey) {
    if (this.exports.hasOwnProperty(key)) {
      fn.warn(`文件 ${this.src} 中 export 的变量 ${key} 有重复，已自动覆盖`)
      fn.info(`    ${this.stringifyExportKey(this.exports[key])}`)
      fn.info(`    ${this.stringifyExportKey(obj)}`)
    }
    this.exports[key] = obj
  }
  private analyzeExport(options: IFileCompileOptions) {
    this.content.replace(config.exportLineRegexp, rawline => {
      let line = fn.stripInlineComment(rawline)
      if (config.lineExportAllRegExp.test(line)) {
        // 没有导出任何变量
        this.oldJsExport = true
      } else if (config.lineExportLocalsFromRegexp.test(line) || config.lineExportAllFromRegExp.test(line)) {
        let locals = RegExp.$1.trim()
        let from = this.findReferedFile(RegExp.$2)
        if (!from) throw new Error(`找不到 ${this.src} 中 ${line} 引用的文件`)

        const refFile = File.compile(from, options) // 继续编译下一个文件
        if (locals !== '*') {
          locals.split(config.splitRegexp)
            .map(local => {
              let {key, ref} = this.splitToKeyRef(local)
              this._addExportKey(key, {from: from as string, ref})
            })
        } else {
          refFile.declares.forEach(key => this._addExportKey(key, {from: refFile.src}))
          Object.keys(refFile.exports).forEach(key => this._addExportKey(key, refFile.exports[key]))
        }
      } else if (config.lineExportDefaultRegexp.test(line)) {
        this.declares.push(config.KEY_DEFAULT)
      } else if (config.lineExportVariableRegexp.test(line)) {
        const d = RegExp.$1
        // ts 中允许重载，所以需要去除同一文件中重新定义的声明
        if (this.declares.indexOf(d) < 0) this.declares.push(d)
      } else if (config.lineExportLocalsRegexp.test(line)) {
        let locals = RegExp.$1.trim()
        if (locals) {
          locals.split(config.splitRegexp).forEach(local => {
            let {key, ref} = this.splitToKeyRef(local)

            const iptKey = ref || key
            const ipt = this.imports[iptKey]
            if (ipt) {
              const {from} = ipt
              const iptFile = File.compile(from, options) // 继续编译下一个文件
              if (ipt.isAll) {
                this._addExportKey(key, {from, ref: config.KEY_ALL})
              } else if (ipt.isDefault) {
                this._addExportKey(key, {from, ref: config.KEY_DEFAULT})
              } else {
                const refKey = ipt.ref || iptKey
                if (iptFile.declares.indexOf(refKey)) {
                  this._addExportKey(key, {from, ref: refKey === key ? undefined : refKey})
                } else if (iptFile.exports[refKey]) {
                  this._addExportKey(key, iptFile.exports[refKey])
                } else {
                  fn.error(`在文件 ${from} 找不到文件 ${this.src} 需要的变量 ${refKey}`)
                  throw new SyntaxError('compile 失败')
                }
              }
            } else {
              this.declares.push(key)
            }
          })
        }
      } else {
        fn.error(`暂时不支持解析 ${line} 中的 export 语法，来自文件 ${this.src}`)
        throw new SyntaxError('compile 失败')
      }

      return rawline
    })
  }
  //#endregion

  //#region analyzeImport
  private _addImportKey(key: string, obj: IFileImportKey, options: IFileCompileOptions, checkIfIsReallyDefault?: boolean) {
    let from = this.findReferedFile(obj.from)
    if (!from) {
      // 如果是相对目录时，不应该解析失败！
      // 绝对目录可能是 node_modules 下的目录
      if (obj.from.charAt(0) === '.') fn.warn(`无法解析到文件 "${obj.from}"，来自文件 ${this.src}，已自动忽略`)
      return
    }

    if (checkIfIsReallyDefault) {
      if (File.compile(from, options).declares.indexOf(config.KEY_DEFAULT) < 0) {
        obj.isDefault = false
        obj.isAll = true
      }
    }
    obj.from = from

    if (this.imports.hasOwnProperty(key)) {
      fn.warn(`文件 ${this.src} 中 import 的变量 ${key} 有重复，已自动覆盖`)
    }
    this.imports[key] = obj
  }

  private _analyzeImportLocals(locals: string, from: string, options: IFileCompileOptions) {
    locals = locals.trim()
    if (!locals) return
    locals.split(config.splitRegexp)
      .forEach(field => {
        let {key, ref} = this.splitToKeyRef(field)
        this._addImportKey(key, {ref, from}, options)
      })
  }

  private analyzeImport(options: IFileCompileOptions) {
    this.content.replace(config.importLineRegExp, rawline => {
      let line = fn.stripInlineComment(rawline)

      if (config.lineImportDefaultRegExp.test(line)) {
        this._addImportKey(RegExp.$1, {isDefault: true, from: RegExp.$2}, options, true)
      } else if (config.lineImportAllRegExp.test(line)) {
        this._addImportKey(RegExp.$1, {isAll: true, from: RegExp.$2}, options)
      } else if (config.lineImportAllAndLocalsRegExp1.test(line)) {
        let all = RegExp.$1
        let alias = RegExp.$2
        let from = RegExp.$3
        this._addImportKey(all, {isAll: true, from}, options)
        this._analyzeImportLocals(alias, from, options)
      } else if (config.lineImportAllAndLocalsRegExp1.test(line)) {
        let alias = RegExp.$1
        let all = RegExp.$2
        let from = RegExp.$3
        this._addImportKey(all, {isAll: true, from}, options)
        this._analyzeImportLocals(alias, from, options)
      } else if (config.lineImportLocalsRegExp.test(line)) {
        this._analyzeImportLocals(RegExp.$1, RegExp.$2, options)
      } else {
        // 可能是 import './a.scss' 的调用形式
        if (config.lineImportOnlyRegExp.test(line)) return rawline
        fn.warn(`暂时不支持解析 ${line} 中的 import，来自文件 ${this.src}`)
      }
      return rawline
    })
  }
  //#endregion

  private splitToKeyRef(key: string): {key: string, ref?: string} {
    if (config.asRegexp.test(key)) return {key: RegExp.$2, ref: RegExp.$1}
    return {key}
  }

  private findReferedFile(ref: string, tryDirectory = true): string | null {
    if (ref[ref.length - 1] === '/') {
      tryDirectory = false
      ref += 'index' // 如果是目录的话，取目录下的 index 文件
    }

    let base = path.resolve(path.dirname(this.src), ref)
    let dtsFile = base + '.d.ts'
    let tsFile = base + '.ts'
    let tsxFile = base + '.tsx'

    return fn.isFileExists(dtsFile) ? dtsFile
      : fn.isFileExists(tsFile) ? tsFile
      : fn.isFileExists(tsxFile) ? tsxFile
      : tryDirectory ? this.findReferedFile(ref + '/', false) : null

  }
}

export const compile = File.compile
