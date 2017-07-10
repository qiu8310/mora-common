import * as React from 'react'
import autobind from '../util/autobind'
import classSet from '../util/classSet'
import AlloyFinger from 'alloyfinger/react/react-alloy_finger.jsx'
import {TransitionGroup} from 'react-transition-group'
import TransitionGroupItem from './TransitionGroupItem'

import './style/Slider.scss'

export interface ISliderProps {
  loop?: boolean
  start?: number
  direction?: 'horizontal' | 'vertical'
  animation?: string
  speed?: number | string
  offset?: number
  afterChange?: (to: number) => void
  beforeChange?: (from: number) => void
}

export default class Slider extends React.PureComponent<ISliderProps, any> {
  static defaultProps = {
    loop: false,
    start: 0,
    direction: 'vertical',
    animation: 'move',
    speed: 800,
    offset: 20,
    beforeChange: () => {},
    afterChange: () => {}
  }

  isSliding = false

  state = {
    total: React.Children.toArray(this.props.children).length,
    reverse: false,
    currentSlide: this.props.start
  }

  private slider: HTMLDivElement
  private slide: TransitionGroupItem
  private canSlideNext: boolean
  private canSlidePrev: boolean

  slideTo(index, reverse: boolean = null) {
    let last = this.state.total - 1
    let prevSlide = this.state.currentSlide
    index = index < 0 ? 0 : index > last ? last : index
    if (index === prevSlide || this.isSliding) return

    this.setState({currentSlide: index, reverse: reverse == null ? prevSlide > index : reverse})
  }
  nextSlide() {
    let {total, currentSlide} = this.state
    if (currentSlide === total - 1 && !this.props.loop) return
    this.slideTo((currentSlide + 1) % total, false)
  }
  prevSlide() {
    let {total, currentSlide} = this.state
    if (currentSlide === 0 && !this.props.loop) return
    this.slideTo((currentSlide + total - 1) % total, true)
  }

  private get slideStyle(): React.CSSProperties {
    let {clientHeight: height, clientWidth: width} = document.documentElement
    let {speed} = this.props
    if (/^\d+$/.test(speed + '')) speed = speed + 'ms'

    return {height, width, display: 'block', WebkitAnimationDuration: speed, animationDuration: speed}
  }

  private get child(): React.ReactNode {
    let {children, animation} = this.props
    let {slideStyle} = this
    let child: any = React.Children.toArray(children)[this.state.currentSlide]

    return (
      <TransitionGroupItem
          ref={s => this.slide = s}
          key={child.key || this.state.currentSlide}
          name={animation}
          beforeEnter={this.beforeChildEnter}
          afterEnter={this.afterChildEnter}
          beforeLeave={this.beforeChildLeave}
          className='wSliderSlide'
          style={slideStyle}
        >
          {child}
        </TransitionGroupItem>
    )
  }

  render() {
    let {direction} = this.props
    let {reverse} = this.state
    let cls = reverse ? direction + 'Reverse' : direction

    return (
      <AlloyFinger onSwipe={this.onSwipe}>
        <div ref={s => this.slider = s}>
          <TransitionGroup component='div' className={classSet('wSlider', cls)} onTouchStart={this.onTouchStart}>
            {this.child}
          </TransitionGroup>
        </div>
      </AlloyFinger>
    )
  }

  @autobind private beforeChildEnter(el) {
    this.isSliding = true
    el.classList.add('current')
    this.props.beforeChange(this.state.currentSlide - 1)
  }

  @autobind private afterChildEnter(el: HTMLSpanElement) {
    this.isSliding = false
    this.props.afterChange(this.state.currentSlide)
  }

  @autobind private beforeChildLeave(el: HTMLSpanElement) {
    el.classList.remove('current')
  }

  @autobind private onTouchStart() {
    let container = this.slider.children[0].children[0]
    let {clientHeight: containerHeight, clientWidth: containerWidth, scrollTop, scrollLeft} = container
    let {clientHeight: childHeight, clientWidth: childWidth} = container.children[0]

    let {offset, direction} = this.props
    switch (direction) {
      case 'vertical':
        this.canSlideNext = containerHeight + scrollTop + offset - childHeight >= 0
        this.canSlidePrev = scrollTop - offset <= 0
        break
      case 'horizontal':
        this.canSlideNext = containerWidth + scrollLeft + offset - childWidth >= 0
        this.canSlidePrev = scrollLeft - offset <= 0
        break
    }
  }

  @autobind private onSwipe(e) {
    let swipe = e.direction.toLowerCase()
    if (this.props.direction === 'vertical') {
      if (swipe === 'up' && this.canSlideNext) {
        this.nextSlide()
      } else if (swipe === 'down' && this.canSlidePrev) {
        this.prevSlide()
      }
    } else {
      if (swipe === 'left' && this.canSlideNext) {
        this.nextSlide()
      } else if (swipe === 'right' && this.canSlidePrev) {
        this.prevSlide()
      }
    }
  }
}
