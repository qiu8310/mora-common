// // 参考 https://github.com/mridgway/hoist-non-react-statics

// const REACT_STATICS = {
//   childContextTypes: true,
//   contextTypes: true,
//   defaultProps: true,
//   displayName: true,
//   getDefaultProps: true,
//   mixins: true,
//   propTypes: true,
//   type: true
// }

// const KNOWN_STATICS = {
//   name: true,
//   length: true,
//   prototype: true,
//   caller: true,
//   arguments: true,
//   arity: true
// }

// const isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function'

// export default function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
//   if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
//     var keys = Object.getOwnPropertyNames(sourceComponent)

//     /* istanbul ignore else */
//     if (isGetOwnPropertySymbolsAvailable) {
//       keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent))
//     }

//     for (var i = 0; i < keys.length; ++i) {
//       if (!REACT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
//         try {
//           targetComponent[keys[i]] = sourceComponent[keys[i]]
//         } catch (e) {}
//       }
//     }
//   }
//   return targetComponent
// }
export function hoistNonReactStatics() {}
