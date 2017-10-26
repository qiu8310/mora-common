import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
import {isFileExists} from './utils'

export interface IIndexifyOptions {
  deep?: number
  filter?: (stats: fs.Stats, name: string, relativePath: string, absolutePath: string) => boolean
}

interface IInnerOptions {
  deep?: number
  getRelativePath?: (absolutePath: string) => string
  filter?: (stats: fs.Stats, name: string, absolutePath: string) => boolean
  exportAll?: string[]
}

export function indexify(folder: string, options: IIndexifyOptions = {}): string {
  options = {deep: 0, filter: () => true, ...options}

  folder = path.resolve(folder)
  let getRelativePath = (absolutePath: string) => path.relative(folder, absolutePath)
  let filter = (stats: fs.Stats, name: string, absolutePath: string) => options.filter(stats, name, getRelativePath(absolutePath), absolutePath)

  let opts: IInnerOptions = {deep: options.deep, filter, getRelativePath, exportAll: []}
  let lines = indexifyFolder(folder, 1, opts)

  // 有些脚本是 import * as xxx from './xxx' 写的
  // 需要把它们全收集起来，放到最后去导出
  if (opts.exportAll.length) {
    lines.push(`export {${opts.exportAll.join(', ')}}`)
  }
  return lines.join(os.EOL)
}

function indexifyFolder(folder, currentDeep: number, opts: IInnerOptions): string[] {
  const indexes = ['index.d.ts', 'index.ts', 'index.tsx']
  let result: string[] = []

  if (opts.deep !== 0 && currentDeep > opts.deep) return result

  if (currentDeep !== 1) {
    for (let f of indexes) {
      if (checkIndex(path.join(folder, f), result, opts)) return result
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
          result.push(indexifyFile(absolutePath, opts))
        } else if (stat.isDirectory()) {
          result.push(...indexifyFolder(absolutePath, currentDeep + 1, opts))
        }
      }
    })
  return result
}

function checkIndex(file, result: string[], opts: IInnerOptions): boolean {
  if (isFileExists(file)) {
    result.push(indexifyFile(file, opts))
    return true
  }
  return false
}

function indexifyFile(file, opts: IInnerOptions): string {
  let fileContent = fs.readFileSync(file).toString()
  let relative = opts.getRelativePath(file.replace(/(\.d)?\.\w+$/, ''))

  let ref = './' + relative.replace(/\/index/, '/')

  if (/^export\s+=\s+/m.test(fileContent)) {
    let name = path.basename(relative)
    opts.exportAll.push(name)
    return `import * as ${name} from '${ref}'`
  }

  return `export * from '${ref}'`
}
