/**
 * 将 .d.ts 文件转换成 .d.json 文件
 */
import * as fs from 'fs'
import * as path from 'path'
import {stripInlineComment, isFileExists} from './utils'
import {cache} from '../../util/cache'

// 匹配带 export 的行
const exportLineRegexp = /^export\s+.*?$/gm
// 匹配 `export * from 'xxx' 或 export {a, b as c} from 'xxx'
const lineRefRegexp = /^export\s+(?:\*|\{([^}]*?)\})\s+from\s+['"](.*?)['"]/

// 匹配 export default
const lineVariable1Regexp = /^export\s+default\s+/
// 匹配的变量的声明，如 export interface xxx,  export class yyy
const lineVariable2Regexp = /^export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|type|function|interface|const|let)\s+(\w+)/
// 匹配的变量的声明，如 export {a, b as c}，注意和 lineRefRegexp 区分，这里没有 from
const lineVariable3Regexp = /^export\s+\{([^}]*?)\}/

const splitRegexp = /\s*,\s*/
const asRegexp = /^(\w+)\s+as\s+(\w+)$/

export interface ICompiledObjPropAliasVariable {key: string, ref?: string}
export interface ICompiledObjPropAlias {from: string, variables: ICompiledObjPropAliasVariable[]}
export interface ICompiledObj {aliases: ICompiledObjPropAlias[], variables: string[]}
export interface ICompiledObjMap {[key: string]: ICompiledObj}

export interface IExportToFileMap {
  [key: string]: string
}

const COMPILE_CACHE: ICompiledObjMap = {}
const ASSEMBLE_CACHE: {[file: string]: IExportToFileMap} = {}

export function dts2djson(dtsFile: string, disableCache?: boolean): IExportToFileMap {
  return assemble(path.resolve(dtsFile), disableCache)
}

// 组装
function assemble(entryFile: string, disableCache: boolean): IExportToFileMap {
  const getImportFile = file => path.relative(path.dirname(entryFile), file).replace(/(?:\.d\.ts|\.tsx?)$/, '')

  return cache<IExportToFileMap>(ASSEMBLE_CACHE, entryFile, disableCache, () => {
    let entry = compile(entryFile, disableCache)

    let result = {}
    entry.variables.forEach(v => result[v] = '')
    _fetchAliases(entry.aliases, result, getImportFile)
    return result
  })
}

function _fetchAliases(aliases: ICompiledObjPropAlias[], result: IExportToFileMap, getImportFile) {
  aliases.forEach(a => {
    if (a.variables.length) {
      a.variables.forEach(v => result[v.key] = _fetch(v, a.from, getImportFile))
    } else {
      // 取出所有引用的文件中的变量
      let cp = COMPILE_CACHE[a.from]
      cp.variables.forEach(v => result[v] = getImportFile(a.from))
      _fetchAliases(cp.aliases, result, getImportFile)
    }
  })
}

function _fetch(v: ICompiledObjPropAliasVariable, from: string, getImportFile: (file: string) => string): string {
  let compiled = COMPILE_CACHE[from]

  let hasRef = !!v.ref
  let needKey: string = hasRef ? v.ref : v.key

  // 不考虑程序的语法问题
  if (compiled.variables.indexOf(needKey) >= 0) return getImportFile(from) + (hasRef ? '::' + v.ref : '')
  for (let alias of compiled.aliases) {
    if (alias.variables.length) {
      for (let aliasVariable of alias.variables) {
        if (aliasVariable.key === needKey) return _fetch(aliasVariable, alias.from, getImportFile)
      }
    } else {
      return _fetch(v, alias.from, getImportFile)
    }
  }
}

// 编译
function compile(file: string, disableCache: boolean): ICompiledObj {
  return cache<ICompiledObj>(COMPILE_CACHE, file, disableCache, () => {
    const aliases: ICompiledObjPropAlias[] = []
    const variables: string[] = []

    fs.readFileSync(file).toString().replace(exportLineRegexp, (line) => {
      line = stripInlineComment(line)
      if (lineRefRegexp.test(line)) {
        let exps = RegExp.$1
        let ref = RegExp.$2
        if (ref[ref.length - 1] === '/') ref += 'index' // 如果是目录的话，取目录下的 index 文件

        let base = path.resolve(path.dirname(file), ref)
        let dtsFile = base + '.d.ts'
        let tsFile = base + '.ts'
        let tsxFile = base + '.tsx'
        let nextFile = isFileExists(dtsFile) ? dtsFile
                     : isFileExists(tsFile) ? tsFile
                     : isFileExists(tsxFile) ? tsxFile : null
        if (!nextFile) throw new Error(`找不到 ${file} 中 ${line} 引用的文件`)

        // 如果此变量为空，就表示导出所有文件中的变量
        let aliasVariables: ICompiledObjPropAliasVariable[] = []
        if (exps) {
          exps.split(splitRegexp)
            .map(v => aliasVariables.push(asRegexp.test(v) ? {key: RegExp.$2, ref: RegExp.$1} : {key: v}))
        }

        aliases.push({from: nextFile, variables: aliasVariables})
        compile(nextFile, disableCache)
      } else if (lineVariable1Regexp.test(line)) {
        variables.push('default')
      } else if (lineVariable2Regexp.test(line)) {
        variables.push(RegExp.$1)
      } else if (lineVariable3Regexp.test(line)) {
        variables.push(...parseExportField(RegExp.$1, 2))
      } else {
        throw new Error(`无法解析文件 ${file} 中 ${line} 的 export 语法，请联系项目作者`)
      }
      return line
    })
    return {aliases, variables}
  })
}

/**
 * 解析 {a as b, c} 成 ["a", "c"] 或 ["b", "C"]
 * 取 a 还是职 b，根据第二个参数 index 来决定
 */
function parseExportField(field: string, index: 1 | 2): string[] {
  field = field.trim()
  return field
    ? field.split(splitRegexp).map(w => asRegexp.test(w) ? RegExp['$' + index] : w)
    : []
}
