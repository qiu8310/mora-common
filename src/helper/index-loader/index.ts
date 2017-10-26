import * as loaderUtils from 'loader-utils'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import {once} from '../../util/once'

import {dts2djson, IExportToFileMap, MAP_KEY_ALL, MAP_SEPARATOR} from './dts2djson'
import {env, isFileExists, stripInlineComment, warn, info} from './utils'

const EOL = os.EOL

export interface IIndexLoaderQueryModule {
  name: string
  dtsFile?: string
  djsonFile?: string
  debug: boolean
  realtimeParse: boolean
  regexp: RegExp

  /** 程序注入的变量 */
  json?: IExportToFileMap
  pathPrefix?: string  // 当 package.json 中定义的 typings 使用了子文件夹时，子文件夹的目录需要记录下来，然后注入到 djson 中
}

export interface IIndexLoaderQuery {
  resolveRoots: string[]
  debug: boolean
  modules: IIndexLoaderQueryModule[]
}

/*
  可配置成：
    {
      resolveRoots: [],         // 里面路径需要使用绝对路径
      debug: false,             // 输出调试信息
      realtimeParse: false,     // 设置全局默认值，主要看 modules 内的值
      modules: [
        'antd',
        {
          name: 'antd',
          dtsFile: 'path/to/xxx2.d.ts',     // 指定当前模块所对应的 .d.ts 或 .ts 文件所在位置，用于生成 d.json，默认从 node_modules/xxx2 下找
          djsonFile: 'path/to/xxx2.d.json', // 指定模块所对应的 .d.json 文件路径，默认情况下会自动查找，可以不配置
          debug: true,
          realtimeParse: true               // 表示实时分析出模块所对应的 d.json 文件导出的变量，启用后会影响 webpack 编译速度
        }
      ]
    }
*/
const parseQuery: (context) => IIndexLoaderQuery = (function() {
  let cache
  return (context) => {
    if (cache) return cache

    let query = loaderUtils.getOptions(context) || {}

    let resolveRoots = query.resolveRoots || []
    let debug = query.debug || false
    let realtimeParse = query.realtimeParse || false
    let modules: IIndexLoaderQueryModule[] = query.modules || []

    modules = modules.map(m => {
      return {
        debug,
        realtimeParse,
        ...(typeof m === 'string' ? {name: m} : m),
        // 前面不需要包含换行符，所以用 [ \t]* 而不用 \s*
        regexp: new RegExp(`^([ \\t]*)(import|export)\\s+\\{([^}]+)\\}\\s+from\\s+(['"])${m.name}\\4`, 'mg')
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

  let logHead = once(() => console.log(`${EOL}::::: ${this.resourcePath} :::::`))

  query.modules.forEach(m => {
    content = content.replace(m.regexp, (raw, preSpaces, inOut, rawimports, quote) => {
      if (m.debug) logHead()

      const imports: {[key: string]: Array<{field: string, fieldKey: string, fieldRef: string, alias: string}>} = {}
      const importFiles = []
      const iptMap = getDJson(query.resolveRoots, this.resourcePath, m)

      const bracketPrefixSpace = rawimports.match(/^\s*/)[0]
      const bracketSuffixSpace = rawimports.match(/^\s*/)[0]
      const joinFields = (fields: string[]) => `${bracketPrefixSpace}${fields.join(', ')}${bracketSuffixSpace}`

      stripInlineComment(rawimports.trim()).split(splitRegexp).forEach(field => {
        let fieldKey: string = field
        let fieldRef: string
        if (asRegexp.test(field)) {
          fieldRef = RegExp.$1
          fieldKey = RegExp.$2
        }
        let rawfile = iptMap[fieldRef || fieldKey]

        if (!rawfile) {
          throw new Error(`要导出的字段 "${field}" 不在 ${m.name} 的模块中`)
        }

        // file 和 alias 都可能是 空字符串
        let [file, alias] = rawfile.split(MAP_SEPARATOR)

        if (!imports[file]) {
          importFiles.push(file)
          imports[file] = []
        }

        // imports[file].push(alias ? `${alias} as ${field}` : field)
        imports[file].push({alias, field, fieldKey, fieldRef})
      })

      const replaces = importFiles.reduce((res: string[], file) => {
        const fromFile = `from ${quote}${m.name}${file ? '/' + file : ''}${quote}`
        let fields = imports[file]
          .filter(it => {
            if (it.alias === MAP_KEY_ALL) {
              res.push(`${preSpaces}${inOut} * as ${it.fieldKey} ${fromFile}`) // import * as xxx from './xxx'
              return false
            } else if (it.alias === 'default') {
              res.push(`${preSpaces}${inOut} ${it.fieldKey} ${fromFile}`) // import xxx from './xxx'
              return false
            }
            return true
          })
          .map(it => it.alias ? `${it.alias} as ${it.fieldKey}` : it.field)

        if (fields.length) {
          res.push(`${preSpaces}${inOut} {${joinFields(fields)}} ${fromFile}`)
        }
        return res
      }, []).join(EOL)

      if (m.debug) info(`${raw}  =>  ${EOL}${replaces}`)
      return replaces
    })
  })

  return content
}

function getDJson(resolveRoots: string[], srcCodeFile: string, m: IIndexLoaderQueryModule) {
  if (m.json && !m.realtimeParse) return m.json

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

  let json = dts2djson(dtsFile, {disableCache: m.realtimeParse})
  if (m.pathPrefix) {
    Object.keys(json).forEach(key => json[key] = path.join(m.pathPrefix, json[key]))
  }
  m.json = json
  return json
}

function getIndexFile(m: IIndexLoaderQueryModule, mFileKey: string, filename: string, resolveRoots: string[]): string {
  if (mFileKey && m[mFileKey]) return m[mFileKey]

  for (let root of resolveRoots) {
    let filepath = path.join(root, m.name, filename)

    if (!mFileKey && /node_modules$/.test(root)) {
      try {
        let moduleRoot = path.join(root, m.name)
        let pkg = require(path.join(moduleRoot, 'package.json'))
        let tmpfilepath = path.join(moduleRoot, pkg.typings)
        if (!isFileExists(tmpfilepath)) warn(`模块 ${m.name} 指定的 typings 文件 ${pkg.typings} 不存在`)
        else {
          m.pathPrefix = path.dirname(pkg.typings).replace(/^\.\/?/, '')
          filepath = tmpfilepath
        }
      } catch (e) {}
    }

    if (isFileExists(filepath)) {
      if (mFileKey) m[mFileKey] = filepath
      if (m.debug) info(`====> 自动读取到 ${m.name} 的入口文件 ${filepath}`)
      return filepath
    }
  }
}
