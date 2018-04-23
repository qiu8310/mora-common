/** 匹配带 export 的所有行 */
export const exportLineRegexp = /^export\s+.*?$/gm

/**
 * 匹配 export = xxx
 */
export const lineExportAllRegExp = /^export\s+=\s+(\w+)/

/**
 * 匹配 export { a, b as c } from 'xxx';
 *
 * $1 是 " a, b as c "
 *
 * $2 是 "xxx"
 */
export const lineExportLocalsFromRegexp = /^export\s+\{([^}]*?)\}\s+from\s+['"](.*?)['"]/

/**
 * 匹配 export * from 'xxx'
 *
 * $1 是 "*"
 *
 * $2 是 'xxx'
 */
export const lineExportAllFromRegExp = /^export\s+(\*)\s+from\s+['"](.*?)['"]/

/** 匹配 export default */
export const lineExportDefaultRegexp = /^export\s+(default)\s+/

/** 匹配的变量的声明，如 export interface xxx,  export class yyy */
export const lineExportVariableRegexp = /^export\s+(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:class|type|function|interface|const|let)\s+(\w+)/

/** 匹配的变量的声明，如 export {a, b as c}，注意和 lineExportLocalsFromRegexp 区分，这里没有 from */
export const lineExportLocalsRegexp = /^export\s+\{([^}]*?)\}/

/** 匹配带 import 的所有行 */
export const importLineRegExp = /^import\s+.*?$/gm
/** 匹配 import * as xxx from './xxx' */
export const lineImportAllRegExp = /^import\s+\*\s+as\s+(\w+)\s+from\s+['"](.*?)['"]/

/**
 * 匹配
 *
 * export namespace xxx {
 *  // ....
 * }
 *
 * 会将 namespace 中的所有 export 清空，所以要保证当前有个同名的 export 存在
 */
export const exportNamespaceRegExp = /^export namespace[\s\S]*?\n\}/gm

/**
 * 匹配 import xxx from './xxx'
 *
 * 还需要去检查 from 的文件内容是否有 export default，因为 tsconfig 可以开启 allowSyntheticDefaultImports
 */
export const lineImportDefaultRegExp = /^import\s+(\w+)\s+from\s+['"](.*?)['"]/
/** 匹配 import {a, b as c} from './xxx' */
export const lineImportLocalsRegExp = /^import\s+\{([^}]*?)\}\s+from\s+['"](.*?)['"]/
/** 匹配 import './index.scss' 这种只引用的形式 */
export const lineImportOnlyRegExp = /^import\s+['"](.*?)['"]/

/** 匹配 import React, { Component } from 'react'， 需要 tsconfig 开启 allowSyntheticDefaultImports */
export const lineImportAllAndLocalsRegExp1 = /^import\s+(\w+)\s*\,\s*\{[^}]*?\}\s+from\s+['"](.*?)['"]/
/** 匹配 import { Component }, React from 'react'， 需要 tsconfig 开启 allowSyntheticDefaultImports */
export const lineImportAllAndLocalsRegExp2 = /^import\s+\{[^}]*?\}\s*,\s*(\w+)\s+from\s+['"](.*?)['"]/

/**
 * 拆分 locals 里的 "a, b as c" 这种字符串
 *
 * 注意 split 最好前先 trim 字符串，并且确认字符串有值
 */
export const splitRegexp = /\s*,\s*/
/** */
export const asRegexp = /^(\w+)\s+as\s+(\w+)$/

/** 放在文件路径后面的分隔符，后面接文件中的变量 */
export const KEY_SEPARATOR = '::'

/** 放在 KEY_SEPARATOR 后面，表示导出此文件的所有变量 */
export const KEY_ALL = '*'
export const KEY_DEFAULT = 'default'
