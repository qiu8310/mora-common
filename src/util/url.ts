import * as isObject from 'mora-scripts/libs/lang/isObject'

export interface IUrlQuery {
  [key: string]: any
}

// 支持处理 {obj: {a: 1, b: 2}, arr: [0, {c: 3}]} => obj.a=1&obj.b=2&arr[0]=1&arr[1].c=3
export function buildSearch(query: IUrlQuery): string {
  let search = serialize(query).join('&')
  return (search ? '?' : '') + search
}

function serialize(query: any, scope: string = ''): string[] {
  return Object.keys(query).reduce((arr: string[], key: string) => {
    let val = query[key]
    let prefix = scope ? scope + `[${key}]` : key

    // 包括 数组、对象、函数等等
    if (isObject(val)) {
      arr.push(...serialize(val, prefix))
    } else {
      arr.push(encodeURIComponent(prefix) + '=' + encodeURIComponent(val))
    }
    return arr
  }, [])
}

export function parseSearch(search: string): IUrlQuery {
  search = search[0] === '?' ? search.substr(1) : search
  return search.length ? unserialize(search) : {}
}

/*
  参考 nodejs 原生 api: querystring.parse

  将 'a[a1]=1&a[a2]=2&b[b1]=3' =>
    - a1 - 1
  a
    - a2 - 2

  b - b1 - 3

  --------------------
  将 'a[3]=3&a[]=2' =>
    - 3 - 3
  a
    - placeholder - 2

  --------------------
  将 'a[b]=2&a=3' =>
    - b - 2
  a
    - 3

  --------------------
  将 'a=3&a[b]=2' =>
    - 3
  a
    - b - 2

*/
interface ITreeNode {
  key: string
  numbric: boolean
  isLeaf: boolean
  children: ITreeNode[]
}
const PLACEHOLDER_KEY = '__:placeholder:__'
const SCOPE_REG = /(.*?)\[([^\]]*)\]$/
const NUM_REG = /^\d+$/
function search2treeNode(search: string): ITreeNode[] {
  return search.split('&').reduce((nodes: ITreeNode[], raw: string) => {
    let [key, val] = raw.split('=').map(r => decodeURIComponent(r))
    if (!key) return nodes
    let scopes: string[] = []
    while (SCOPE_REG.test(key)) {
      key = RegExp.$1
      scopes.unshift(RegExp.$2)
    }
    scopes.unshift(key)
    scopes.push(val)

    let parents = nodes
    for (let i = 0; i < scopes.length; i++) {
      let scope = scopes[i] || PLACEHOLDER_KEY
      let current: ITreeNode = parents.filter(n => n.key === scope && !n.isLeaf)[0] // 为什么要限制 !n.isLeaf，如 a=1&a[1]=2 这种结构会导致 a=1 消失

      if (!current) {
        current = {key: scope, numbric: scope === PLACEHOLDER_KEY || NUM_REG.test(scope), isLeaf: i === scopes.length - 1, children: []}
        parents.push(current)
      }

      parents = current.children
    }

    return nodes
  }, [] as ITreeNode[])
}

function treeNode2value(node: ITreeNode): any {
  // Leaf 节点不会有 children 字段
  if (node.isLeaf) return node.key

  // 非 Leaf 节点一定有 children 字段
  let children = node.children
  let childCount = children.length
  let firstChild = children[0]

  /**
   * 子节点有多少个叶子节点
   */
  let leafCount = 0

  /**
   * 子节点有多少个纯数字索引的节点（用于判断是否应该构造数组）
   */
  let numCount = 0

  let numMap: any = {} // 记录已经有的数字
  // @ts-ignore
  let findAvailableNum: (() => number) = () => {
    for (let i = 0; i < childCount; i++) {
      if (!numMap[i]) {
        numMap[i] = true
        return i
      }
    }
  }

  for (let child of children) {
    if (child.isLeaf) leafCount++
    else if (child.numbric) {
      numCount++
      if (child.key !== PLACEHOLDER_KEY) numMap[child.key] = true
    }
  }

  // 将 placeholder 替换成数字
  children.filter(child => child.key === PLACEHOLDER_KEY).forEach(child => child.key = findAvailableNum() + '')


  let isAllNum = numCount === childCount
  let nodeValue: any

  /**
   * 计算 node 节点的权重，方便给第2个条件中的 node 排序
   *
   * a=1&a[0]=3&a[1]=2&a=4 => [1, 4, 3, 2]
   * a[0]=3&a=1&a[1]=2&a=4 => [3, 2, 1, 4]
   */
  let nodeWeight = (n: ITreeNode) => n.isLeaf ? (firstChild.isLeaf ? - children.indexOf(n) - childCount : children.indexOf(n) + childCount) : (parseInt(n.key, 10) || 0)

  if (leafCount === childCount) { // 全部是叶子节点，可以是 a=1 或者 a=1&a=2 结构
    nodeValue = leafCount === 1 ? treeNode2value(firstChild) : children.map(child => treeNode2value(child))
  } else if (leafCount > 0) { // 有叶子又有非叶子，可以是 a=3&a[b]=2 或者 a[b]=2&a=3 或者 a=3&a[1]=2 或者 a[1]=2&a=3 或者 a=3&a[b]=2&a[1]=3
    if (numCount + leafCount === childCount) { // 只有叶子节点和数字节点 => 数组，即当为 a=3&a[1]=2 或者 a[1]=2&a=3 时，结果当数组处理
      nodeValue = children.sort((a, b) => nodeWeight(a) - nodeWeight(b)).map(child => child.isLeaf ? child.key : treeNode2value(child))
    } else { // 【有叶子节点和字符节点】或者【有叶子节点，有字符串节点，又有数字节点】，即当为 a[b]=2&a=3 或 a=3&a[b]=2 或 a=3&a[b]=2&a[1]=3 时
      nodeValue = children.reduce((res, child) => { child.isLeaf ? res[findAvailableNum()] = child.key : res[child.key] = treeNode2value(child); return res }, {} as any)
    }
  } else { // 全部是非叶子节点，可以是 a[1]=1&a[2]=2 或者 a[1]=1&a[b]=2
    if (isAllNum) { // 解析成数组
      nodeValue = children.sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10)).map(child => treeNode2value(child))
    } else { // 解析成对象
      nodeValue = children.reduce((res, child) => { res[child.key] = treeNode2value(child); return res }, {} as any)
    }
  }
  return nodeValue
}

function unserialize(search: string): IUrlQuery {
  return search2treeNode(search).reduce((query: IUrlQuery, node) => {
    query[node.key] = treeNode2value(node)
    return query
  }, {} as IUrlQuery)
}

export function appendQuery(url: string, query: string | IUrlQuery) {
  if (typeof query === 'object') {
    query = buildSearch(query).slice(1) // 去掉第一个问号
  }

  if (query === '') return url
  let parts = url.split('#')
  return (parts[0] + '&' + query).replace(/[&?]{1,2}/, '?') + (parts.length === 2 ? ('#' + parts[1]) : '')
}

