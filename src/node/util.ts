import * as crypto from 'crypto'

export function node_md5(str: string) {
  let hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex')
}
