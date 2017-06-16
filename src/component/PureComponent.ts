import * as React from 'react'

import Component from './Component'
import applyMixins from '../util/applyMixins'

class PureComponent<P, S> extends React.PureComponent<P, S> implements Component<P, S> {

}

applyMixins(PureComponent, [Component])

export default PureComponent
