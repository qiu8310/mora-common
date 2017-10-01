export interface IUrlQuery {
  [key: string]: string
}

export function buildSearch(query: IUrlQuery = {}): string {
  let str = Object.keys(query)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
    .join('&')
  return str ? '?' + str : ''
}

export function parseSearch(search: string): IUrlQuery {
  if (search.length < 1) return {}
  return search.substr(1).split('&').reduce((query, pair) => {
    let [key, value] = pair.split('=')
    if (key !== '_k') query[decodeURIComponent(key)] = decodeURIComponent(value)
    return query
  }, {})
}

export function appendQuery(url: string, query: string | IUrlQuery) {
  if (typeof query === 'object') {
    query = buildSearch(query).slice(1) // 去掉第一个问号
  }

  if (query === '') return url
  let parts = url.split('#')
  return (parts[0] + '&' + query).replace(/[&?]{1,2}/, '?') + (parts.length === 2 ? ('#' + parts[1]) : '')
}
