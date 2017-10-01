import * as React from 'react'
import {classSet} from '../util/classSet'
import {Storable, IStoreFunc, IStorableProps} from '../component/implements/Storable'

export interface IPanelProps {
  title: any
}
export class Panel extends React.PureComponent<IPanelProps, any> {
  render() {
    return (
      <div className='wTabPanel'>{this.props.children}</div>
    )
  }
}

export interface ITabProps {
  children: any
  start?: number
  activeClass?: string
  onChange?: (currentIndex: number, lastIndex: number) => void
  className?: string
  style?: React.CSSProperties
}

/**
 * <Tab>
 *  <Tab.Panel title='foo'>...</Tab.Panel>
 *  <Tab.Panel title='bar'>...</Tab.Panel>
 * </Tab>
 */
@Storable.apply()
export class Tab extends React.PureComponent<ITabProps & IStorableProps, any> implements Storable {
  static Panel = Panel
  static defaultProps = {
    activeClass: 'active'
  }

  storable: boolean
  store: IStoreFunc

  constructor(props, context) {
    super(props, context)
    let {start} = props
    let currentIndex = 0
    // 优先使用指定的
    if (start != null && typeof start === 'number' && !isNaN(start)) {
      currentIndex = start
    } else {
      let stored = this.store('index')
      if (stored != null) currentIndex = stored
    }

    this.state = {currentIndex}
  }

  onClickNav(i) {
    let {currentIndex} = this.state
    let {onChange} = this.props
    if (i !== currentIndex) {
      this.setState({currentIndex: i}, () => {
        this.store('index', i)
        if (onChange) onChange(i, currentIndex)
      })
    }
  }

  renderPanel() {
    return this.props.children[this.state.currentIndex]
  }

  render() {
    let {children, activeClass, className, style} = this.props
    let {currentIndex} = this.state
    return (
      <div className={classSet('wTab', className)} style={style}>
        <div className='wTabNavs'>
          {children.map((p, i) => (
            <div key={i} className={classSet('wTabNav', {[activeClass]: i === currentIndex})} onClick={this.onClickNav.bind(this, i)}>
              {p.props.title}
            </div>
          ))}
        </div>
        <div className='wTabPanels'>{this.renderPanel()}</div>
      </div>
    )
  }
}
