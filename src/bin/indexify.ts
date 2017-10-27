#!/usr/bin/env node

import {indexify} from '../helper'
import * as cli from 'mora-scripts/libs/tty/cli'
import * as info from 'mora-scripts/libs/sys/info'
import * as fs from 'fs'
import * as path from 'path'

cli({
  usage: 'indexify <folder1, folder2, ...>'
})
.options({
  'i | index':              '<string>   指定 index 文件名称，默认是 "index.d.ts"',
  'd | deep':               '<number>   递归遍历的深度',
  'r | root':               '<string>   指定输出生成的 index.d.ts 文件的目录，默认是当前处理的目录',
  'nci | noCheckIndex':     '<boolean>  不把目录上的 index.d.ts 或 index.ts 或 index.tsx 文件当作当前目录的入口文件',
  'rd | renameDefault':     '<boolean>  将 export default 的导出的变量重新 alias 到对应的模块名称上',
  'e | exclude':            '<array>    要排除的文件，需要使用全名'
})
.parse(function(res) {
  res._.forEach(folder => {
    let root = res.root || folder
    let content = indexify(folder, {
      root,
      deep: res.deep || 0,
      noCheckIndex: res.noCheckIndex,
      renameDefault: res.renameDefault,
      filter: (stat, name) => res.exclude && res.exclude.length ? res.exclude.indexOf(name) < 0 : true
    })

    let file = path.join(root, res.index || 'index.d.ts')
    fs.writeFileSync(file, content)
    info(`生成文件 ${file}`)
  })
})
