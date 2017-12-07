#!/usr/bin/env node

import {replacer} from '../helper'
import * as cli from 'mora-scripts/libs/tty/cli'
import * as fs from 'fs'
import * as path from 'path'

cli({
  usage: 'replacer <TsFolders, orTsFiles, ...>'
})
.options({
  'm | modules': '<array> 指定模块'
})
.parse(function(res) {
  if (!res.modules) return this.error('需要指定要解析的引用模块名称')

  res.modules = res.modules.map((m: string) => ({name: m}))
  let refs: string[] = []

  Object.defineProperty(res, 'refs', {set(value: string[]) { refs.push(...value.filter(v => refs.indexOf(v) < 0)) }})
  res._.forEach(file => doFile(path.resolve(file), res))

  refs.sort()
  console.log(refs)
})

function doFile(file: string, res: any) {
  let stats = fs.statSync(file)
  if (stats.isDirectory()) {
    doFolder(file, res)
  } else if (stats.isFile()) {
    doTextFile(file, res)
  }
}

function doFolder(folder: string, res: any) {
  fs.readdirSync(folder).forEach(name => {
    doFile(path.join(folder, name), res)
  })
}

function doTextFile(textfile: string, res: any) {
  if (/\.tsx?/.test(textfile)) {
    res.refs = replacer(textfile, res.modules).refModules
  }
}
