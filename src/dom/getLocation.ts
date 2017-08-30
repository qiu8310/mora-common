import {buildSearch, parseSearch, IUrlQuery} from '../util/url'

export interface ILocation {
  url: string, search: string, pathname: string, nativeQuery: IUrlQuery, query: IUrlQuery, hash: string
}

export interface ILocationOptions {
  hash?: boolean
  /** 默认是 "#" */
  separater?: string
}

let cache: any = {}
export default function getLocation(options: ILocationOptions): ILocation {
  let {pathname, search, hash} = window.location
  let {l, p, s, h} = cache
  if (l && p === pathname && s === search && h === hash) return l
  cache = {l: _getLocation(options), p: pathname, s: search, h: hash}
  return cache.l
}

function _getLocation(options: ILocationOptions): ILocation {
  let {pathname, search, hash} = window.location

  let href
  let query

  if (options.hash) {
    href = location.hash.substr((options.separater || '#').length)
    pathname = href.split(/[?#]/).shift()
    search = href.substr(pathname.length).split(/#/).shift()
    hash = href.indexOf('#') >= 0 ? href.substr(href.indexOf('#')) : ''
  }

  query = parseSearch(search)
  search = buildSearch(query)

  return {
    url: pathname + search + hash,
    search,
    pathname,
    nativeQuery: options.hash ? parseSearch(location.search) : query,
    query,
    hash
  }
}

