import * as path from 'path'
import {compile, IFileCompileOptions} from './inc/File'

export interface IDts2djsonOptions extends IFileCompileOptions {}
export interface IDts2djsonResult {
  [key: string]: string
}

export function dts2djson(dtsFile: string, opts: IDts2djsonOptions = {}): IDts2djsonResult {
  let file = compile(dtsFile, opts)

  let result = {}
  file.declares.forEach(key => result[key] = '')
  Object.keys(file.exports).forEach(key => {
    let {from, ref} = file.exports[key]
    from = path.relative(path.dirname(dtsFile), from)
    result[key] = file.stringifyExportKey({from, ref})
  })

  return result
}
