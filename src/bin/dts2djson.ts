#!/usr/bin/env node

import * as path from 'path'
import * as fs from 'fs'

import {dts2djson} from '../helper/'
import * as cli from 'mora-scripts/libs/tty/cli'
import * as mkdirp from 'mora-scripts/libs/fs/mkdirp'

cli({
  usage: 'dts2djson <index.d.ts/index.ts/index.tsx>'
})
.options({
  'ni|naAnalyzeImport': '<boolean> 不分析 import 的变量',
  'o|outFile': '<string> 指定 json 输出的文件，不指定会输出到命令行'
})
.parse(function(res) {
  if (res._.length !== 1) return this.error('一次只能处理一个文件')
  const data = JSON.stringify(dts2djson(res._[0], {
    disableAnalyzeImport: res.naAnalyzeImport
  }), null, 2)

  if (res.outFile) {
    let outFile = path.resolve(res.outFile)
    mkdirp(path.dirname(outFile))
    fs.writeFileSync(outFile, data)
  } else {
    console.log(data)
  }
})
