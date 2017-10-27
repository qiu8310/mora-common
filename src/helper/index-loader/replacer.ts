import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import {once} from '../../util/once'
import {stripInlineComment, info, env, warn, isFileExists} from './inc/fn'
import {KEY_SEPARATOR, KEY_ALL} from './inc/config'
import {dts2djson, IDts2djsonResult} from './dts2djson'

const EOL = os.EOL
const splitRegexp = /\s*,\s*/
const asRegexp = /^(\w+)\s+as\s+(\w+)$/

export interface IReplacerModule {
  /**
   * 模块的名称，如 antd
   */
  name: string

  /**
   * 指定模块所在的根目录
   *
   * 默认会去 node_modules/[name] 下查找
   */
  root?: string

  /**
   * 模块的 .d.json 文件，默认会去模块目录下查找 index.d.json
   */
  djsonFile?: string

  /**
   * 模块的 .d.ts 文件，默认会去模块目录下查找 index.d.ts 文件，或者是 package.json 中指定的 module/typings 字段所指定的文件
   *
   * 如果单独指定了此字段，需要确保 dstFile 要在模块的根目录上，如果不在，则最好也指定 root 根目录
   */
  dtsFile?: string

  /**
   * 实时分析出 djson 文件，不缓存
   */
  realtimeParse?: boolean

  /**
   * 开始 debug，可以输出替换前后的信息
   */
  debug?: boolean
}

export interface IReplacerResult {
  /**
   * 替换的文件
   */
  sourceFile: string
  /**
   * 替换前的文件内容
   */
  sourceContent: string

  /**
   * 替换后的文件内容
   */
  replacedContent: string

  /**
   * 此文件引用的其它模块的路径，如： ['antd/es/Layout/index']
   */
  refModules: string[]
}

const getModuleExportImportExpReg: ((name: string) => RegExp) = (() => {
  let cache = {}
  return (name: string) => {
    if (!cache[name]) cache[name] = new RegExp(`^([ \\t]*)(import|export)\\s+\\{([^}]+)\\}\\s+from\\s+(['"])${name}\\4`, 'mg')
    return cache[name]
  }
})()

const getDJson: ((sourceFile: string, module: IReplacerModule) => IDts2djsonResult) = (() => {
  let cache: {[key: string]: IDts2djsonResult} = {}

  return (sourceFile: string, module: IReplacerModule) => {
    if (!module.realtimeParse && cache[module.name]) return cache[module.name]

    let {rootDir} = env(sourceFile)
    let moduleRoot = module.root || path.join(rootDir, 'node_modules', module.name)

    // 优先读取 .d.json 文件
    let djsonFile = tryToGetFile(module, 'djsonFile', path.join(moduleRoot, 'index.d.json'))
    if (djsonFile) {
      if (module.realtimeParse) return JSON.parse(fs.readFileSync(djsonFile).toString())
      return require(djsonFile)
    }

    // 其次 package.json 中的 module/typings 字段
    let dtsFile
    if (moduleRoot.indexOf('node_modules') > 0) {
      try {
        let pkg = require(path.join(moduleRoot, 'package.json'))
        let moduleTsdFile = pkg.module || pkg.typings
        if (moduleTsdFile) {
          let tmpfilepath = path.join(moduleRoot, moduleTsdFile)
          if (!isFileExists(tmpfilepath)) {
            warn(`模块 ${module.name} 指定的 module/typings 文件 ${moduleTsdFile} 不存在`)
          } else {
            // pathPrefix = path.dirname(moduleTsdFile).replace(/^\.\/?/, '')
            dtsFile = tmpfilepath
          }
        }
      } catch (e) {}
    }

    // 最后尝试 index.d.ts 文件
    if (!dtsFile) dtsFile = tryToGetFile(module, 'dtsFile', path.join(moduleRoot, 'index.d.ts'))
    if (!dtsFile) throw new Error(`配置模块 ${module.name} 没有指定 dtsFile，系统无法找到默认的 .d.ts 文件`)

    let djson = dts2djson(dtsFile, {disableCache: module.realtimeParse})

    // 当 package.json 中定义的 typings 使用了子文件夹时，子文件夹的目录需要记录下来，然后注入到 djson 中
    // 如 antd 中定义了 module: es/index.d.ts；所以需要给 djson 中的所有文件添加 es/ 的前缀
    let pathPrefix = path.relative(moduleRoot, path.dirname(dtsFile))
    if (pathPrefix && pathPrefix !== '.') {
      Object.keys(djson).forEach(key => djson[key] = path.join(pathPrefix, djson[key]))
    }

    cache[module.name] = djson
    return djson
  }
})()

function tryToGetFile(module: IReplacerModule, key: 'djsonFile' | 'dtsFile', defaultFile: string): string {
  if (module[key]) return module[key]
  if (defaultFile && isFileExists(defaultFile)) {
    if (module.debug) info(`====> 自动读取到 ${module.name} 的 ${key} 文件 ${defaultFile}`)
    module[key] = defaultFile
    return defaultFile
  }
}

export function replacer(sourceFile: string, modules: IReplacerModule[]): IReplacerResult
export function replacer(sourceFile: string, sourceContent: string, modules: IReplacerModule[]): IReplacerResult
export function replacer(sourceFile: string, contentOrModules: string | IReplacerModule[], modules?: IReplacerModule[]): IReplacerResult {
  sourceFile = path.resolve(sourceFile)
  let sourceContent = contentOrModules as string
  if (contentOrModules && Array.isArray(contentOrModules)) modules = contentOrModules
  if (!sourceContent || typeof sourceContent !== 'string') sourceContent = fs.readFileSync(sourceFile).toString()

  let logHead = once(() => console.log(`${EOL}::::: ${sourceFile} :::::`))

  const refModules: string[] = []
  let replacedContent = modules.reduce((content: string, module: IReplacerModule) => {
    return content.replace(getModuleExportImportExpReg(module.name), (...args: any[]) => {
      args.unshift(refModules, getDJson(sourceFile, module))

      if (module.debug) logHead()
      return replace.apply(module, args)
    })
  }, sourceContent)

  return {sourceFile, sourceContent, replacedContent, refModules}
}

function replace(this: IReplacerModule, refModules: string[], djson: IDts2djsonResult, raw: string, preSpaces: string, inOut: string, rawimports: string, quote: string) {
  const bracketPrefixSpace = rawimports.match(/^\s*/)[0]
  const bracketSuffixSpace = rawimports.match(/^\s*/)[0]
  const joinBracketFields = (fields: string[]) => `${bracketPrefixSpace}${fields.join(', ')}${bracketSuffixSpace}`

  interface IVariable {alias: string, field: string, fieldKey: string, fieldRef: string}
  interface IAnalyzeResult { variables: {[file: string]: IVariable[]}, files: string[]}

  // 先分析出要导出或导入的变量，方便后面的批量操作
  const result: IAnalyzeResult = {variables: {}, files: []}
  stripInlineComment(rawimports.trim()).split(splitRegexp).reduce((res: IAnalyzeResult, field: string) => {
    let fieldKey: string = field
    let fieldRef: string
    if (asRegexp.test(field)) {
      fieldRef = RegExp.$1
      fieldKey = RegExp.$2
    }

    let rawfile = djson[fieldRef || fieldKey]
    if (!rawfile) throw new Error(`要导出的字段 "${field}" 不在 ${this.name} 的模块中`)

    // file 和 alias 都可能是 空字符串
    let [file, alias] = rawfile.split(KEY_SEPARATOR)

    file = this.name + (file ? '/' + file : '')

    if (!res.variables[file]) {
      if (refModules.indexOf(file) < 0) refModules.push(file)
      res.files.push(file)
      res.variables[file] = []
    }

    res.variables[file].push({alias, field, fieldKey, fieldRef})
    return res
  }, result)

  // 再来一个个替换
  const rawReplace = result.files.reduce((lines: string[], file: string) => {
    const fromFile = `from ${quote}${file}${quote}`
    let variables: IVariable[] = result.variables[file]

    let aliasFields = variables
      .filter(it => {
        if (it.alias === KEY_ALL) {
          lines.push(`${preSpaces}${inOut} * as ${it.fieldKey} ${fromFile}`) // import * as xxx from './xxx'
          return false
        } else if (it.alias === 'default') {
          lines.push(`${preSpaces}${inOut} ${it.fieldKey} ${fromFile}`) // import xxx from './xxx'
          return false
        }
        return true
      })
      .map(it => it.alias ? `${it.alias} as ${it.fieldKey}` : it.field)

    if (aliasFields.length) lines.push(`${preSpaces}${inOut} {${joinBracketFields(aliasFields)}} ${fromFile}`)
    return lines
  }, []).join(EOL)

  if (this.debug) info(`${raw}  =>  ${EOL}${rawReplace}`)
  return rawReplace
}

