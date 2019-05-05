// 不支持 IE9，如 $('.xxx').forEach 在 IE 9 下会报错，没有 forEach 方法
// https://gist.github.com/paulirish/12fb951a8b893a454b32

interface OnEvent {
  on<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, useCapture?: boolean): void
}
interface PolyfillWindow extends OnEvent {
  $<K extends keyof ElementTagNameMap>(selectors: K): ElementTagNameMap[K]
  $(selectors: string): NodeListOf<Element>
}
declare var $: (selectors: string) => NodeListOf<Element>
// declare var $: (selectors: keyof ElementListTagNameMap) => ElementListTagNameMap[keyof ElementListTagNameMap]
interface Window extends PolyfillWindow {}

window.$ = document.querySelectorAll.bind(document)

interface Node extends OnEvent {}
Node.prototype.on = window.on = function(name, fn, useCapture) {
  this.addEventListener(name, fn, useCapture)
}

interface NodeList extends Array<Node> {}
interface NodeList extends OnEvent {
  addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, useCapture?: boolean): void
}
(NodeList.prototype as any).__proto__ = Array.prototype
NodeList.prototype.on = NodeList.prototype.addEventListener = function(name, fn, useCapture) {
  this.forEach(function(elem, i) {
    elem.on(name, fn, useCapture)
  })
}
