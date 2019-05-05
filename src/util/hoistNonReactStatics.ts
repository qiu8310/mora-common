// 参考 https://github.com/mridgway/hoist-non-react-statics

const REACT_STATICS: any = {
  childContextTypes: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
}

const KNOWN_STATICS: any = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
}

const defineProperty = Object.defineProperty
const getOwnPropertyNames = Object.getOwnPropertyNames
const getOwnPropertySymbols = Object.getOwnPropertySymbols
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor
const getPrototypeOf = Object.getPrototypeOf
const objectPrototype = getPrototypeOf && getPrototypeOf(Object)

export function hoistNonReactStatics<T>(targetComponent: T, sourceComponent: any, blacklist?: { [key: string]: boolean }) {
  if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
    if (objectPrototype) {
      let inheritedComponent = getPrototypeOf(sourceComponent)
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist)
      }
    }

    let keys = getOwnPropertyNames(sourceComponent)

    if (getOwnPropertySymbols) {
      // @ts-ignore
      keys = keys.concat(getOwnPropertySymbols(sourceComponent))
    }

    for (let i = 0; i < keys.length; ++i) {
      let key = keys[i]
      if (!REACT_STATICS[key] && !KNOWN_STATICS[key] && (!blacklist || !blacklist[key])) {
        let descriptor: any = getOwnPropertyDescriptor(sourceComponent, key)
        try { // Avoid failures from read-only properties
          defineProperty(targetComponent, key, descriptor)
        } catch (e) { }
      }
    }
  }

  return targetComponent
}
