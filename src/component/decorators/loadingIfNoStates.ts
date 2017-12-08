import * as React from 'react'
import {Loading} from '../../widget/Loading'
import {toArray} from '../../util/array'

export interface ILoadingIfNoStatesOptions {
  required?: string | string[]
  oneOf?: string[]
}

export function loadingIfNoStates(options: string | string[] | ILoadingIfNoStatesOptions) {
  return (Component: React.ComponentClass) => {
    return class extends Component {
      render() {
        let opts: ILoadingIfNoStatesOptions = typeof options === 'string' || Array.isArray(options) ? {required: options} : options

        let state: any = this.state || {}
        let show = true
        if (opts.required && opts.required.length) {
          show = toArray(opts.required).every(key => state[key] != null)
        }

        if (opts.oneOf && opts.oneOf.length) {
          show = opts.oneOf.some(key => state[key] != null)
        }
        return show ? super.render() : React.createElement(Loading)
      }
    } as any
  }
}
