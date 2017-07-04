interface IEventOn {
    on<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, useCapture?: boolean): void;
}
interface PolyfillWindow extends IEventOn {
    $<K extends keyof ElementListTagNameMap>(selectors: K): ElementListTagNameMap[K];
    $(selectors: string): NodeListOf<Element>;
}
declare var $: (selectors: string) => NodeListOf<Element>;
interface Window extends PolyfillWindow {
}
interface Node extends IEventOn {
}
interface NodeList extends Array<Node> {
}
interface NodeList extends IEventOn {
    addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, useCapture?: boolean): void;
}
