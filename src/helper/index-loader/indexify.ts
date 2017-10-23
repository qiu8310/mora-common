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
}

export function indexify(folder: string, options: IIndexifyOptions = {}): string {
  options = {deep: 0, filter: () => true, ...options}

  folder = path.resolve(folder)
  let getRelativePath = (absolutePath: string) => path.relative(folder, absolutePath)
  let filter = (stats: fs.Stats, name: string, absolutePath: string) => options.filter(stats, name, getRelativePath(absolutePath), absolutePath)

  let opts: IInnerOptions = {deep: options.deep, filter, getRelativePath}

  return indexifyFolder(folder, 1, opts).join(os.EOL)
}

function indexifyFolder(folder, currentDeep: number, opts: IInnerOptions): string[] {
  let result: string[] = []
  if (opts.deep !== 0 && currentDeep > opts.deep) return result

  if (currentDeep !== 1) {
    if (checkIndex(path.join(folder, 'index.ts'), result, opts)) return result
    if (checkIndex(path.join(folder, 'index.tsx'), result, opts)) return result
  }

  fs.readdirSync(folder)
    .forEach(name => {
      if (currentDeep === 1 && ['index.ts', 'index.tsx'].indexOf(name) >= 0) return
      if (['_', '.'].indexOf(name[0]) >= 0) return

      let absolutePath = path.join(folder, name)
      let stat = fs.statSync(absolutePath)
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
  let relative = opts.getRelativePath(file.replace(/\.\w+$/, ''))
  return `export * from './${relative.replace(/\/index/, '/')}'`
}
