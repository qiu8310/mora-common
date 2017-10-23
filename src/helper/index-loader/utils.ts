

import * as findup from 'mora-scripts/libs/fs/findup'
import * as exists from 'mora-scripts/libs/fs/exists'
import * as warn from 'mora-scripts/libs/sys/warn'
import * as info from 'mora-scripts/libs/sys/info'
import * as error from 'mora-scripts/libs/sys/error'
import * as path from 'path'

export interface IEnvResult {
  rootDir: string
}

const envCache: IEnvResult[] = []

/**
 * 根据项目中的某一个文件，获取当前项目的一些基本信息
 */
export function env(srcFile: string): IEnvResult {
  for (let cache of envCache) {
    if (srcFile.indexOf(cache.rootDir) === 0) return cache
  }

  let pkgFile = findup.pkg(path.dirname(srcFile))
  let result = {
    rootDir: path.dirname(pkgFile)
  }
  envCache.push(result)
  return result
}

/**
 * 祛除单行中的注释
 */
export function stripInlineComment(line: string): string {
  return line.replace(/\/\*.*?\*\//g, '')
}

export function isFileExists(file: string): boolean {
  return exists(file)
}

export {warn, info, error}
