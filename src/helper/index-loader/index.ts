import * as loaderUtils from 'loader-utils'

import {replacer, IReplacerModule} from './replacer'

export interface IIndexLoaderQuery {
  realtimeParse?: boolean
  debug?: boolean
  modules?: Array<string | IReplacerModule>
}

/*
  可配置成：
    {
      debug: false,             // 输出调试信息
      realtimeParse: false,     // 设置全局默认值，主要看 modules 内的值
      modules: [
        'antd',                 // 可以只配置单个名称，或者下面的详细信息

        {
          name: 'antd',
          root: 'path/to/antd/root'
          dtsFile: 'path/to/xxx2.d.ts',     // 指定当前模块所对应的 .d.ts 或 .ts 文件所在位置，用于生成 d.json，默认从 node_modules/xxx2 下找
          djsonFile: 'path/to/xxx2.d.json', // 指定模块所对应的 .d.json 文件路径，默认情况下会自动查找，可以不配置
          debug: true,
          realtimeParse: true               // 表示实时分析出模块所对应的 d.json 文件导出的变量，启用后会影响 webpack 编译速度
        }
      ]
    }
*/
module.exports = function(this: any, content: string) {
  if (this.cacheable) this.cacheable()

  let query: IIndexLoaderQuery = loaderUtils.getOptions(this) || {}

  let debug = query.debug || false
  let realtimeParse = query.realtimeParse || false

  let modules: IReplacerModule[] = (query.modules || []).map(m => ({
    debug,
    realtimeParse,
    ...(typeof m === 'string' ? {name: m} : m),
  }))

  return replacer(this.resourcePath, content, modules).replacedContent
}

