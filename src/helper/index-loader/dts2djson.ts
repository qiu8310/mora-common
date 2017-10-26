/**
 * 将 .d.ts 文件转换成 .d.json 文件
 */
import * as fs from 'fs'
import * as path from 'path'
import {stripInlineComment, isFileExists, warn} from './utils'
import {cache} from '../../util/cache'

// 匹配带 export 的行
const exportLineRegexp = /^export\s+.*?$/gm
// 匹配 `export * from 'xxx' 或 export {a, b as c} from 'xxx'
const lineExportRefRegexp = /^export\s+(?:\*|\{([^}]*?)\})\s+from\s+['"](.*?)['"]/

// 匹配 export default
const lineExportDefaultRegexp = /^export\s+default\s+/
// 匹配的变量的声明，如 export interface xxx,  export class yyy
const lineExportVariableRegexp = /^export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|type|function|interface|const|let)\s+(\w+)/
// 匹配的变量的声明，如 export {a, b as c}，注意和 lineExportRefRegexp 区分，这里没有 from
const lineExportAliasRegexp = /^export\s+\{([^}]*?)\}/

const importLineRegExp = /^import\s+.*?$/gm
const lineImportAllRegExp = /^import\s+\*\s+as\s+(\w+)\s+from\s+['"](.*?)['"]/
const lineImportDefaultRegExp = /^import\s+(\w+)\s+from\s+['"](.*?)['"]/
const lineImportAliasRegExp = /^import\s+\{([^}]*?)\}\s+from\s+['"](.*?)['"]/
const lineImportOnlyRegExp = /^import\s+['"](.*?)['"]/

// 当 ts 开启了 allowSyntheticDefaultImports 时，可以这样写： import React, { Component } from 'react' 或者 import {Component}, React from 'react'
const lineImportAllAndAliasRegExp1 = /^import\s+(\w+)\s*\,\s*\{[^}]*?\}\s+from\s+['"](.*?)['"]/
const lineImportAllAndAliasRegExp2 = /^import\s+\{[^}]*?\}\s*,\s*(\w+)\s+from\s+['"](.*?)['"]/


const splitRegexp = /\s*,\s*/
const asRegexp = /^(\w+)\s+as\s+(\w+)$/

export const MAP_SEPARATOR = '::'
export const MAP_KEY_ALL = '*'

export interface ICompileImportStruct { from?: string, isDefault?: boolean, isAll?: boolean, ref?: string }
export interface ICompileImportStructMap {[key: string]: ICompileImportStruct}


export interface ICompileStructExportVariable { key: string, ref?: string }
export interface ICompileStructImport { expKey?: string, impKey?: string, impRef?: string, isDefault?: boolean, isAll?: boolean }

export interface ICompileStructRef { from?: string, import?: ICompileStructImport, exports?: ICompileStructExportVariable[] }
export interface ICompileStruct { declares: string[], refs: ICompileStructRef[] }
export interface ICompileStructMap { [key: string]: ICompileStruct }


export interface IExportToFileMap {
  [key: string]: string
}

const COMPILE_CACHE: ICompileStructMap = {}
const ASSEMBLE_CACHE: {[file: string]: IExportToFileMap} = {}

export interface IDts2djsonOptions {
  disableCache?: boolean
  /**
   * 因为有些会对 import 过来的变量处理下，所以所以有时可能需要开启此选项
   */
  disableAnalyzeImport?: boolean
}

export function dts2djson(dtsFile: string, opts: IDts2djsonOptions = {}): IExportToFileMap {
  return assemble(path.resolve(dtsFile), opts)
}

// 组装
function assemble(entryFile: string, opts: IDts2djsonOptions): IExportToFileMap {
  const getImportFile = file => path.relative(path.dirname(entryFile), file).replace(/(?:\.d\.ts|\.tsx?)$/, '')

  return cache<IExportToFileMap>(ASSEMBLE_CACHE, entryFile, opts.disableCache, () => {
    let entry = compile(entryFile, opts)

    let result: IExportToFileMap = {}
    let addResult = (key: string, value: string) => {
      if (result.hasOwnProperty(key)) {
        warn(`${value} 中导出的 ${key} 覆盖了 ${result[key]} 中导出的同名字段`)
      }
      result[key] = value
    }
    entry.declares.forEach(v => result[v] = '')
    _assembleRefs(entry.refs, addResult, getImportFile)
    return result
  })
}

function _assembleRefs(refs: ICompileStructRef[], addResult: (key: string, value: string) => void, getImportFile) {
  refs.forEach(ref => {
    let {import: ipt, exports: exps, from} = ref
    if (!from) warn(ref)
    if (ipt) {
      if (ipt.isAll) {
        /*
          import * as b from './b'
          export {b}
        */
        addResult(ipt.expKey, getImportFile(from) + MAP_SEPARATOR + MAP_KEY_ALL)
      } else if (ipt.isDefault) {
        /*
          import b from './b'
          export {b}
        */
        addResult(ipt.expKey, getImportFile(from) + MAP_SEPARATOR + 'default')
      } else {
        /*
          import {b1, xx as b2, b3} from './b'
          export {b1, b2 as bb, b3 as bbb}
        */
        let {expKey, impKey, impRef} = ipt
        if (!impRef && expKey !== impKey) impRef = impKey
        // else if (impRef === expKey) impRef = null

        let value = _fetch({key: impKey, ref: impRef}, from, getImportFile)
        /*
          过滤掉下面这种情况：

          import {c as b} from './b'
          export {b as c}

          => result[c] = 'b::c'
        */
        let [file, alias] = value.split(MAP_SEPARATOR)
        if (alias === expKey) value = file

        addResult(expKey, value)
      }
    } else if (exps) {
      if (exps.length) {
        exps.forEach(v => addResult(v.key, _fetch(v, from, getImportFile)))
      } else {
        // 取出所有引用的文件中的变量
        let cp = COMPILE_CACHE[from]
        cp.declares.forEach(v => addResult(v, getImportFile(from)))
        _assembleRefs(cp.refs, addResult, getImportFile)
      }
    } else {
      // 不应该会出现
      warn(ref)
      throw new Error(`ICompileStructRef 格式错误，至少需要一个 import 或 exports`)
    }
  })
}

function _fetch(v: ICompileStructExportVariable, from: string, getImportFile: (file: string) => string): string {
  let compiled = COMPILE_CACHE[from]

  let hasRef = !!v.ref
  let needKey: string = hasRef ? v.ref : v.key

  if (compiled.declares.indexOf(needKey) >= 0) return getImportFile(from) + (hasRef ? MAP_SEPARATOR + v.ref : '')
  for (let ref of compiled.refs) {
    /*
      // a.ts
      export {b} from './b'

      // b.ts 中的变量 b 不会出现 isAll 或 isDefault 或 import {x} from './c' 中
    */
    if (ref.import) {
      // 不需要考虑
    } else if (ref.exports.length) {
      for (let exp of ref.exports) {
        if (exp.key === needKey) return _fetch(exp, ref.from, getImportFile)
      }
    } else {
      return _fetch(v, ref.from, getImportFile)
    }
  }

  warn(`从文件 ${from} 中找不到要导出的变量 ${JSON.stringify(v)}`)
}

// 编译
function compile(file: string, opts: IDts2djsonOptions): ICompileStruct {
  return cache<ICompileStruct>(COMPILE_CACHE, file, opts.disableCache, () => {
    const iptMap: ICompileImportStructMap = {}

    const declares: string[] = []
    const refs: ICompileStructRef[] = []

    let content = fs.readFileSync(file).toString()
    if (!opts.disableAnalyzeImport) {
      // 分析 import
      content.replace(importLineRegExp, rawline => {
        let line = stripInlineComment(rawline)
        let add = (key: string, obj: ICompileImportStruct) => {
          let {from} = obj
          obj.from = _findReferencedPath(file, from)
          if (!obj.from) {
            // 如果是相对目录时，不应该解析失败！
            // 绝对目录可能是 node_modules 下的目录
            if (from.charAt[0] === '.') {
              warn(`已忽略：无法解析 "${from}" 来自文件 ${file}`)
            }
            return
          }
          iptMap[key] = obj
        }

        let analiseAlias = (ipts: string, from: string) => {
          ipts = ipts.trim()
          if (!ipts) return
          ipts.split(splitRegexp)
            .forEach(v => {
              if (asRegexp.test(v)) {
                add(RegExp.$2, {ref: RegExp.$1, from})
              } else {
                add(v, {from})
              }
            })
        }

        if (lineImportDefaultRegExp.test(line)) {
          add(RegExp.$1, {isDefault: true, from: RegExp.$2})
        } else if (lineImportAllRegExp.test(line)) {
          add(RegExp.$1, {isAll: true, from: RegExp.$2})
        } else if (lineImportAllAndAliasRegExp1.test(line)) {
          let all = RegExp.$1
          let alias = RegExp.$2
          let from = RegExp.$3
          add(all, {isAll: true, from})
          analiseAlias(alias, from)
        } else if (lineImportAllAndAliasRegExp2.test(line)) {
          let alias = RegExp.$1
          let all = RegExp.$2
          let from = RegExp.$3
          analiseAlias(alias, from)
          add(all, {isAll: true, from})
        } else if (lineImportAliasRegExp.test(line)) {
          analiseAlias(RegExp.$1, RegExp.$2)
        } else {
          // 可能是 import './a.scss' 的调用形式
          if (lineImportOnlyRegExp.test(line)) return rawline
          warn(`暂时不支持解析 ${file} 中 ${line} 的 import`)
        }
        return rawline
      })
    }

    // 分析 export
    content.replace(exportLineRegexp, rawline => {
      let line = stripInlineComment(rawline)

      // 可以是 export * from 'xxx' 或 export {a, b} from 'xxx'
      if (lineExportRefRegexp.test(line)) {
        let exps = RegExp.$1.trim()
        let ref = RegExp.$2

        let from = _findReferencedPath(file, ref)
        if (!from) throw new Error(`找不到 ${file} 中 ${line} 引用的文件`)

        let exports: ICompileStructExportVariable[] = []
        if (exps) {
          exps.split(splitRegexp)
            .map(v => exports.push(asRegexp.test(v) ? {key: RegExp.$2, ref: RegExp.$1} : {key: v}))
        }
        // 如果 exports 变量为空，就表示导出所有文件中的变量
        refs.push({from, exports})
        compile(from, opts)
      } else if (lineExportDefaultRegexp.test(line)) {
        declares.push('default')
      } else if (lineExportVariableRegexp.test(line)) {
        const d = RegExp.$1
        // ts 中允许重载，所以需要去除同一文件中重新定义的声明
        if (declares.indexOf(d) < 0) declares.push(d)
      } else if (lineExportAliasRegexp.test(line)) {
        let exps = RegExp.$1.trim()
        if (exps) {
          exps.split(splitRegexp).forEach(v => {
            let isAs = asRegexp.test(v)
            const key = isAs ? RegExp.$2 : v
            const keyRef = isAs ? RegExp.$1 : null

            const iptKey = keyRef || key
            const ipt = iptMap[iptKey]
            if (ipt) {
              const {from, ref, isAll, isDefault} = ipt
              refs.push({from, import: {isAll, isDefault, expKey: key, impKey: iptKey, impRef: ref}})
            } else {
              declares.push(key)
            }
          })
        }
      } else {
        throw new Error(`暂时不支持解析文件 ${file} 中 ${line} 的 export 语法`)
      }
      return rawline
    })
    return {declares, refs}
  })
}

function _findReferencedPath(currentFile: string, ref: string, tryDirectory = true) {
  if (ref[ref.length - 1] === '/') {
    tryDirectory = false
    ref += 'index' // 如果是目录的话，取目录下的 index 文件
  }

  let base = path.resolve(path.dirname(currentFile), ref)
  let dtsFile = base + '.d.ts'
  let tsFile = base + '.ts'
  let tsxFile = base + '.tsx'
  return isFileExists(dtsFile) ? dtsFile
              : isFileExists(tsFile) ? tsFile
              : isFileExists(tsxFile) ? tsxFile
              : tryDirectory ? _findReferencedPath(currentFile, ref + '/', false) : null

}
