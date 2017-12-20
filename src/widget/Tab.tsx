import * as React from 'react'
import {classSet} from '../util/classSet'
import {Storable, IStorableFunc, IStorableProps} from '../component/implements/Storable'

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
  store: IStorableFunc

  constructor(props: ITabProps, context: any) {
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

  get current() {
    return this.state.currentIndex
  }

  tabTo(index: number, callback?: (prevIndex: number) => void) {
    let {currentIndex} = this.state
    let {onChange} = this.props
    if (index !== currentIndex) {
      this.setState({currentIndex: index}, () => {
        this.store('index', index)
        if (onChange) onChange(index, currentIndex)
        if (callback) callback(currentIndex)
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
          {children.map((p: any, i: number) => (
            <div key={i} className={classSet('wTabNav', {[activeClass as string]: i === currentIndex})} onClick={() => this.tabTo(i)}>
              <span className='wTabNavText'>{p.props.title}</span>
            </div>
          ))}
        </div>
        <div className='wTabPanels'>{this.renderPanel()}</div>
      </div>
    )
  }
}
