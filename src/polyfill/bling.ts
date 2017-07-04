// https://gist.github.com/paulirish/12fb951a8b893a454b32

interface IEventOn {
  on<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, useCapture?: boolean): void
}

interface PolyfillWindow extends IEventOn {
  $<K extends keyof ElementListTagNameMap>(selectors: K): ElementListTagNameMap[K]
  $(selectors: string): NodeListOf<Element>
}

interface Window extends PolyfillWindow {}
window.$ = document.querySelectorAll.bind(document)

interface Node extends IEventOn {}
Node.prototype.on = window.on = function(name, fn, useCapture) {
  this.addEventListener(name, fn, useCapture)
}

interface NodeList extends IEventOn {
  __proto__: any
  addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, useCapture?: boolean): void
}
NodeList.prototype.__proto__ = Array.prototype
NodeList.prototype.on = NodeList.prototype.addEventListener = function(name, fn, useCapture) {
  this.forEach(function(elem, i) {
    elem.on(name, fn, useCapture)
  })
}
