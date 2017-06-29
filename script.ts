#!/usr/bin/env ts-node

import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'

import * as inject from 'mora-scripts/libs/fs/inject'
import * as cli from 'mora-scripts/libs/tty/cli'
import * as shell from 'mora-scripts/libs/tty/shell'

const ROOT_DIR = __dirname
const SRC_DIR = path.join(__dirname, 'src')

cli({
  usage: './script.ts [options] <command>'
})
.commands({
  ignore: {
    desc: '根据 src 目录下的文件夹自动记录应该 ignore 掉的文件',
    cmd(res) {
      const ignores = getRootDirectoryNames()

      injectReplace(path.join(__dirname, '.gitignore'), ignores, name => `${name}`)
      injectReplace(path.join(__dirname, '.vscode', 'settings.json'), ignores, name => `"${name}": true,`)
    }
  },
  exports: {
    desc: '注入 export 在 index.ts 中',
    cmd(res) {
      let exports = getRootDirectoryNames()
        .reduce((lines, directoryName) => {
          if (directoryName !== 'candidate') {
            lines.push(
              ...fs.readdirSync(path.join(SRC_DIR, directoryName))
                .filter(filename => /\.tsx?$/.test(filename))
                .map(filename => `export * from './${directoryName}/${filename.replace(/\.tsx?$/, '')}'`)
            )
          }
          return lines
        }, []).join(os.EOL)

      console.log(inject(path.join(SRC_DIR, 'index.ts'), {exports}) === 1 ? '操作成功' : '操作失败')
    }
  },
  cpStyle: {
    desc: '将 src 目录下的所有 style 文件夹移动对应的根目录',
    cmd(res) {
      getAllDirectorys(SRC_DIR)
        .filter(filepath => path.basename(filepath) === 'style')
        .forEach(filepath => fs.copySync(filepath, path.join(ROOT_DIR, filepath.substr(SRC_DIR.length))))
    }
  },
  clean: {
    desc: '清除 tsc 生成的文件夹',
    cmd(res) {
      getRootDirectoryNames().forEach(name => fs.removeSync(path.join(__dirname, name)))
    }
  },
  __test: {
    desc: '临时用的测试脚本',
    cmd(res) {

    }
  }
})
.parse(function(res) {
  this.error('没有指定要执行的命令')
})

function getAllDirectorys(directory): string[] {
  return fs.readdirSync(directory).reduce((result, name) => {
    let newFile = path.join(directory, name)
    if (fs.statSync(newFile).isDirectory()) {
      result.push(newFile, ...getAllDirectorys(newFile))
    }
    return result
  }, [])
}

function getRootDirectoryNames(): string[] {
  return fs.readdirSync(SRC_DIR).filter(name => fs.statSync(path.join(SRC_DIR, name)).isDirectory())
}

function injectReplace(file, ignores, mapFn) {
  const data = {folders: ignores.map(mapFn).join(os.EOL)}
  console.log(`成功注入 ${inject(file, data)} 次到文件 ${file} 中`)
}
