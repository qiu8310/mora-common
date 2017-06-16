#!/usr/bin/env ts-node

import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'

import * as inject from 'mora-scripts/libs/fs/inject'
import * as cli from 'mora-scripts/libs/tty/cli'

cli({
  usage: './script.ts [options] <command>'
})
.commands({
  ignore: {
    desc: '根据 src 目录下的文件夹自动记录应该 ignore 掉的文件',
    cmd(res) {
      const ignores = getRootDirectoryNames()

      injectReplace(path.join(__dirname, '.gitignore'), ignores, name => `./${name}`)
      // injectReplace(path.join(__dirname, 'tsconfig.json'), ignores, name => `"${name}",`)
      injectReplace(path.join(__dirname, '.vscode', 'settings.json'), ignores, name => `"${name}": true,`)
    }
  },
  empty: {
    desc: '清除 tsc 生成的文件夹',
    cmd(res) {
      getRootDirectoryNames().forEach(name => fs.removeSync(path.join(__dirname, name)))
    }
  }
})
.parse(function(res) {
  this.error('没有指定要执行的命令')
})

function getRootDirectoryNames(): string[] {
  const src = path.join(__dirname, 'src')
  return fs.readdirSync(src).filter(name => fs.statSync(path.join(src, name)).isDirectory)
}

function injectReplace(file, ignores, mapFn) {
  const data = {folders: ignores.map(mapFn).join(os.EOL)}
  console.log(`成功注入 ${inject(file, data)} 次到文件 ${file} 中`)
}
