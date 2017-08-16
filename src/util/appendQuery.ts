export default function appendQuery(url: string, query: string | Object) {
  if (typeof query === 'object') {
    query = Object.keys(query).map(k => `${k}=${query[k]}`).join('&')
  }

  if (query === '') return url
  let parts = url.split('#')
  return (parts[0] + '&' + query).replace(/[&?]{1,2}/, '?') + (parts.length === 2 ? ('#' + parts[1]) : '')
}
