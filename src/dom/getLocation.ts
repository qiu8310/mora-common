import {url} from '../util/url'

const {buildSearch, parseSearch} = url

export namespace getLocation {
  export interface Location {
    url: string, search: string, pathname: string, nativeQuery: url.Query, query: url.Query, hash: string
  }

  export interface Options {
    hash?: boolean
    /** 默认是 "#" */
    separater?: string
  }
}

let cache: any = {}
export function getLocation(options: getLocation.Options = {}): getLocation.Location {
  let {pathname, search, hash} = window.location
  let {l, p, s, h} = cache
  if (l && p === pathname && s === search && h === hash) return l
  cache = {l: _getLocation(options), p: pathname, s: search, h: hash}
  return cache.l
}

function _getLocation(options: getLocation.Options): getLocation.Location {
  let {pathname, search, hash} = window.location

  let href
  let query

  if (options.hash) {
    href = location.hash.substr((options.separater || '#').length)
    pathname = href.split(/[?#]/).shift() || ''
    search = href.substr(pathname.length).split(/#/).shift() || ''
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
