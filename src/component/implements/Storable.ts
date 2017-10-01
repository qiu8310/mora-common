import * as React from 'react'
import {applyMixins} from '../../util/applyMixins'

export declare type IStorableKey = string | number
export interface IStorableProps {
  store?: any
  storeKey?: IStorableKey
}
export declare type IStoreFunc = (key: IStorableKey, value?: any) => any

export class Storable extends React.PureComponent<IStorableProps, any> {
  static apply() {
    return Ctor => applyMixins(Ctor, Storable)
  }

  get storable() {
    return !!(this.props.store && this.props.storeKey)
  }
  store(key: IStorableKey, value?: any): any {
    let {store, storeKey} = this.props
    let isGet = typeof value === 'undefined'

    if (store != null && storeKey != null) {
      storeKey = 'Storable--' + storeKey
      if (!store[storeKey]) {
        if (isGet) return
        else store[storeKey] = {}
      }

      if (isGet) return store[storeKey][key]
      else store[storeKey][key] = value
    }
  }
}
