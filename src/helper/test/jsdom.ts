import {JSDOM} from 'jsdom'

const dom = new JSDOM('')
let g: {window: any, document: any} = global as any

g.window = dom.window
g.document = dom.window.document

