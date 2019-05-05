#!/usr/bin/env ts-node

import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'

import * as inject from 'mora-scripts/libs/fs/inject'
import * as cli from 'mora-scripts/libs/tty/cli'
import * as shell from 'mora-scripts/libs/tty/shell'
import * as error from 'mora-scripts/libs/sys/error'
import * as chokidar from 'chokidar'

import {indexify, dts2djson} from './src/helper'

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
      let exports = indexify(SRC_DIR, {filter: (stats, name, relative, absolute) => {
        return stats.isFile()
          ? /\.tsx?$/.test(name)
          : stats.isDirectory()
            ? name !== 'candidate' && name !== 'bin'
            : false
      }})
      if (inject(path.join(SRC_DIR, 'index.ts'), {exports}) !== 1) console.error('注入 export 失败')
    }
  },
  exportsMap: {
    desc: '生成导出的 map 文件，方便 webpack loader 插件 mora-common 中的 index-loader 使用',
    cmd(res) {
      const map = dts2djson(path.join(ROOT_DIR, 'index.d.ts'))
      fs.writeFileSync(path.join(ROOT_DIR, 'index.d.json'), JSON.stringify(map, null, 2))
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
  watch: {
    desc: '只要文件变化就执行 npm run build',
    cmd(res) {
      let sid: NodeJS.Timer
      chokidar.watch(SRC_DIR, {ignored: /__(tests|mocks)__/}).on('all', () => {
        clearTimeout(sid)
        sid = setTimeout(() => {
          shell.promise('npm run build')
            .then(() => console.log(new Date().toLocaleString() + ' build successfully'))
            .catch(e => console.error('build error'))
        }, 800)
      })
    }
  },
  installTo: {
    desc: '将当前包安装到指定的目录下（将将指定的目录清空），方便测试此包',
    cmd(res) {
      if (res._.length !== 1) return error('只需要提供一个目录即可')
      let destDir = res._[0]
      fs.ensureDirSync(destDir)
      fs.emptyDirSync(destDir)
      // getRootDirectoryNames().forEach(f => {
      //   fs.copySync(path.join(ROOT_DIR, f), path.join(destDir, f))
      // })
      fs.readdirSync(ROOT_DIR)
        .filter(f => f !== 'src' && f !== 'node_modules' && f[0] !== '.' && f !== 'tsconfig.json')
        .forEach(f => {
          fs.copySync(path.join(ROOT_DIR, f), path.join(destDir, f))
        })
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

function getAllDirectorys(directory: string): string[] {
  return fs.readdirSync(directory).reduce((result, name) => {
    let newFile = path.join(directory, name)
    if (fs.statSync(newFile).isDirectory()) {
      result.push(newFile, ...getAllDirectorys(newFile))
    }
    return result
  }, [] as string[])
}

function getRootDirectoryNames(): string[] {
  return fs.readdirSync(SRC_DIR).filter(name => fs.statSync(path.join(SRC_DIR, name)).isDirectory())
}

function injectReplace(file: string, ignores: string[], mapFn: (from: string) => string) {
  const data = {folders: ignores.map(mapFn).join(os.EOL)}
  console.log(`成功注入 ${inject(file, data)} 次到文件 ${file} 中`)
}
