import * as loaderUtils from 'loader-utils'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import {once} from '../../util/once'

import {dts2djson} from './dts2djson'
import {env, isFileExists, stripInlineComment, warn, info} from './utils'

const EOL = os.EOL

export interface IQueryModule {
  name: string
  dtsFile?: string
  djsonFile?: string
  debug: boolean
  realtimeParse: boolean
  regexp: RegExp
}

export interface IQuery {
  resolveRoots: string[]
  debug: boolean
  modules: IQueryModule[]
}

/*
  可配置成：
    {
      resolveRoots: [],         // 里面路径需要使用绝对路径
      debug: false,             // 输出调试信息
      realtimeParse: false,     // 设置全局默认值，主要看 modules 内的值
      modules: [
        'xxx1',
        {
          name: 'xxx2',
          dtsFile: 'path/to/xxx2.d.ts',     // 指定当前模块所对应的 .d.ts 或 .ts 文件所在位置，用于生成 d.json，默认从 node_modules/xxx2 下找
          djsonFile: 'path/to/xxx2.d.json', // 指定模块所对应的 .d.json 文件路径，默认情况下会自动查找，可以不配置
          debug: true,
          realtimeParse: true               // 表示实时分析出模块所对应的 d.json 文件导出的变量，启用后会影响 webpack 编译速度
        }
      ]
    }
*/
const parseQuery: (context) => IQuery = (function() {
  let cache
  return (context) => {
    if (cache) return cache

    let query = loaderUtils.getOptions(context) || {}

    let resolveRoots = query.resolveRoots || []
    let debug = query.debug || false
    let realtimeParse = query.realtimeParse || false
    let modules: IQueryModule[] = query.modules || []

    modules = modules.map(m => {
      return {
        debug,
        realtimeParse,
        ...(typeof m === 'string' ? {name: m} : m),
        regexp: new RegExp(`^(\\s*)(import|export)\\s+\\{([^}]+)\\}\\s+from\\s+(['"])${m.name}\\4`, 'mg')
      }
    })

    cache = {resolveRoots, debug, modules}
    if (debug) info('配置：', cache)
    return cache
  }
})()

const splitRegexp = /\s*,\s*/
const asRegexp = /^(\w+)\s+as\s+(\w+)$/

module.exports = function(content) {
  if (this.cacheable) this.cacheable()

  let query = parseQuery(this)

  let replaced
  let logHead = once(() => query.debug && (replaced = true) && console.log(`${EOL}-----------------${this.resourcePath}-----------------`))
  let logFoot = once(() => query.debug && replaced && console.log(new Array(35 + this.resourcePath.length).join('=')))

  query.modules.forEach(m => {
    content = content.replace(m.regexp, (raw, preSpaces, inOut, rawimports, quote) => {
      logHead()

      const imports = {}
      const importFiles = []
      const map = getDJson(query.resolveRoots, this.resourcePath, m)

      stripInlineComment(rawimports.trim()).split(splitRegexp).forEach(field => {
        let rawfile = map[asRegexp.test(field) ? RegExp.$1 : field]

        if (!rawfile) {
          throw new Error(`要导出的字段 "${field}" 不在 ${m.name} 的模块中`)
        }

        // file 和 alias 都可能是 空字符串
        let [file, alias] = rawfile.split('::')

        if (!imports[file]) {
          importFiles.push(file)
          imports[file] = []
        }

        imports[file].push(alias ? `${alias} as ${field}` : field)
      })

      const replaces = importFiles.map(file => `${preSpaces}${inOut} { ${imports[file].join(', ')} } from ${quote}${m.name}${file ? '/' + file : ''}${quote}`).join(EOL)

      if (m.debug) info(`${JSON.stringify(raw)}  =>  ${JSON.stringify(replaces)}`)

      return replaces
    })
  })

  logFoot()
  return content
}

function getDJson(resolveRoots: string[], srcCodeFile: string, m: IQueryModule) {
  let {rootDir} = env(srcCodeFile)
  resolveRoots = [...resolveRoots, path.join(rootDir, 'node_modules')]

  // 优先读取 .d.json 文件
  let djsonFile = getIndexFile(m, 'djsonFile', 'index.d.json', resolveRoots)
  if (djsonFile) {
    if (m.realtimeParse) return JSON.parse(fs.readFileSync(djsonFile).toString())
    return require(djsonFile)
  }

  let dtsFile = getIndexFile(m, 'dtsFile', 'index.d.ts', resolveRoots)
  if (!dtsFile) {
    dtsFile = getIndexFile(m, null, 'index.ts', resolveRoots)
    if (!dtsFile) dtsFile = getIndexFile(m, null, 'index.tsx', resolveRoots)
    if (!dtsFile) {
      throw new Error(`配置模块 ${m.name} 没有指定 dtsFile，系统无法找到默认的 .d.ts 文件`)
    }
    if (m.debug) warn(`配置模块 ${m.name} 没有指定 dtsFile，系统尝试使用 ${dtsFile} 文件`)
  }

  return dts2djson(dtsFile, m.realtimeParse)
}

function getIndexFile(m: IQueryModule, mFileKey: string, filename: string, resolveRoots: string[]): string {
  if (mFileKey && m[mFileKey]) return m[mFileKey]

  for (let root of resolveRoots) {
    let filepath = path.join(root, m.name, filename)
    if (isFileExists(filepath)) {
      if (mFileKey) m[mFileKey] = filepath
      if (m.debug) info(`====> 自动读取到 ${m.name} 的入口文件 ${filepath}`)
      return filepath
    }
  }
}
