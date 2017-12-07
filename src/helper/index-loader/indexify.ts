import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import {upperFirst} from '../../util/string'
import {isFileExists, warn, info} from './inc/fn'
import {KEY_DEFAULT} from './inc/config'
import {compile} from './inc/File'

export interface IIndexifyOptions {
  /**
   * 指定生成的 index.d.ts 文件会存放的位置，默认是 indexify 第一个参数指定的 folder
   *
   * 指定一个和 folder 不一样的目录会导致程序重新计算文件的引用
   */
  root?: string
  /** 如果遇到目录下有个 index.d.ts 或 index.ts 或 index.tsx 文件，则会把它当作入口文件，不继续处理此目录下的其它所有文件和子目录。开启此选项可以禁用此功能 */
  noCheckIndex?: boolean
  /** 启用将 export default 的导出的变量重新 alias 到对应的模块名称 */
  renameDefault?: boolean
  /** 对当前文件 export default 导出成另一个指定的名字，默认是当前文件名或文件的目录名（文件名是 index 时用目录名） */
  rename?: (file: string) => string

  /** 递归遍历的目录的深度，默认 0，全部递归完 */
  deep?: number
  /** 自定义过滤函数，返回需要处理的文件或文件夹 */
  filter?: (stats: fs.Stats, name: string, relativePath: string, absolutePath: string) => boolean
}

interface IInnerOptions extends IIndexifyOptions {
  deep: number
  rename: (file: string) => string
  filter: (stats: fs.Stats, name: string, absolutePath: string) => boolean
  getRelativePath: (absolutePath: string) => string
  imports: string[]
  exports: string[]
  exportAll: string[]
  addExportName: (name: string, from: string) => boolean
}

function rename(file: string): string {
  let name = path.basename(file, path.extname(file)).replace(/\.d$/, '')
  if (/index/i.test(name)) name = path.basename(path.dirname(file))
  name = name.toLowerCase()
    .split(/[-_\s]+/).map(w => upperFirst(w))
    .join('')
  return name
}

export function indexify(folder: string, options: IIndexifyOptions = {}): string {
  let optionFilter = options.filter || (() => true)

  folder = path.resolve(folder)
  let getRelativePath = (absolutePath: string) => {
    return path.relative(options.root || folder, absolutePath)
  }

  let map: {[key: string]: string} = {}
  let addExportName = (name: string, from: string) => {
    let exists = map.hasOwnProperty(name)
    if (exists) {
      warn(`重复导出了变量 ${name} ，自动忽略了后面的`)
      info(`    ${map[name]}`)
      info(`    ${from}`)
    } else {
      map[name] = from
    }
    return !exists
  }
  let filter = (stats: fs.Stats, name: string, absolutePath: string) => optionFilter(stats, name, getRelativePath(absolutePath), absolutePath)
  let opts: IInnerOptions = {rename, deep: 0, ...options, filter, getRelativePath, imports: [], exports: [], exportAll: [], addExportName}

  indexifyFolder(folder, 1, opts)

  let lines: string[] = []
  opts.imports.forEach(i => lines.push(i))
  opts.exports.forEach(e => lines.push(e))
  if (opts.exportAll.length) lines.push(`export {${opts.exportAll.join(', ')}}`)
  return lines.join(os.EOL)
}

function indexifyFolder(folder: string, currentDeep: number, opts: IInnerOptions) {
  const indexes = ['index.d.ts', 'index.ts', 'index.tsx']

  if (opts.deep !== 0 && currentDeep > opts.deep) return

  if (currentDeep !== 1 && !opts.noCheckIndex) {
    for (let f of indexes) {
      if (checkIndex(path.join(folder, f), opts)) return
    }
  }

  fs.readdirSync(folder)
    .forEach(name => {
      if (currentDeep === 1 && indexes.indexOf(name) >= 0) return
      if (['_', '.'].indexOf(name[0]) >= 0) return

      let absolutePath = path.join(folder, name)
      let stat = fs.statSync(absolutePath)
      if (stat.isFile() && !(/\.tsx?$/.test(name))) return

      if (opts.filter(stat, name, absolutePath)) {
        if (stat.isFile()) {
          indexifyFile(absolutePath, opts)
        } else if (stat.isDirectory()) {
          indexifyFolder(absolutePath, currentDeep + 1, opts)
        }
      }
    })
}

function checkIndex(file: string, opts: IInnerOptions): boolean {
  if (isFileExists(file)) {
    indexifyFile(file, opts)
    return true
  }
  return false
}

function indexifyFile(file: string, opts: IInnerOptions): void {
  let f = compile(file)
  let relative = opts.getRelativePath(file.replace(/(\.d)?\.tsx?$/, '')) // 去除后缀

  let from = './' + relative.replace(/\/index$/, '/') // 去除最后的 index
  let importfrom = `from '${from}'`

  if (f.oldJsExport) {
    let name = path.basename(relative)
    if (opts.addExportName(name, from)) {
      opts.exportAll.push(name)
      opts.imports.push(`import * as ${name} ${importfrom}`)
    }
  } else {
    let declares = [...f.declares, ...Object.keys(f.exports)]
    let originalLength = declares.length
    declares.sort()

    let name
    if (opts.renameDefault && declares.indexOf(KEY_DEFAULT) >= 0) {
      declares = declares.filter(d => d !== KEY_DEFAULT)
      name = opts.rename(f.src)
      if (name && !opts.addExportName(name, from)) name = false
    }
    declares = declares.filter(d => opts.addExportName(d, from))
    if (name) declares.unshift(`${KEY_DEFAULT} as ${name}`)

    if (declares.length) {
      if (!name && declares.length === originalLength) {
        opts.exports.push(`export * ${importfrom}`)
      } else {
        opts.exports.push(`export {${declares.join(', ')}} ${importfrom}`)
      }
    }
  }
}
