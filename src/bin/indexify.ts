#!/usr/bin/env node

import {indexify} from '../helper'
import * as cli from 'mora-scripts/libs/tty/cli'
import * as fs from 'fs'
import * as path from 'path'

cli({
  usage: 'indexify <folder1, folder2, ...>'
})
.options({
  'i | index': '<string> 指定 index 文件名称，默认是 "index.d.ts"',
  'd | deep': '<number> 递归遍历的深度',
  'e | exclude': '<array> 要排除的文件，需要使用全名'
})
.parse(function(res) {
  res._.forEach(folder => {
    let content = indexify(folder, {
      deep: res.deep || 0,
      filter: (stat, name) => res.exclude && res.exclude.length ? res.exclude.indexOf(name) < 0 : true
    })
    fs.writeFileSync(path.join(folder, res.index || 'index.d.ts'), content)
  })
})
