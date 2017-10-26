## References

* typescript 支持的 export 和 import 的写法：https://www.typescriptlang.org/docs/handbook/modules.html#import


## Todos

* [ ] 支持导出 node_modules 下的组件中的变量，如 `export {Link} from 'react-router-dom'`
* [ ] 支持将 export {foo, bar} 写在多行上
* [x] 支持分开写的语法，如：

  ```ts
  import a from './a'
  export {a}
  ```

* [x] 支持 ts 文件使用 `export default` 的写法
* [x] 支持 export {foo as bar} from 'xxx' 的写法
