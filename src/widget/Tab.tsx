import * as React from 'react'
import classSet from '../util/classSet'

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
export class Tab extends React.PureComponent<ITabProps, any> {
  static Panel = Panel
  static defaultProps = {
    start: 0,
    activeClass: 'active'
  }

  state = {
    currentIndex: this.props.start
  }

  onClickNav(i) {
    let {currentIndex} = this.state
    let {onChange} = this.props
    if (i !== currentIndex) {
      this.setState({currentIndex: i}, () => {
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

export default Tab
