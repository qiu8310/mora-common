import * as React from 'react'
import {autobind} from '../util/autobind'
import {classSet} from '../util/classSet'
import {Finger} from './Finger'
import {TransitionGroup} from 'react-transition-group'
import {TransitionGroupItem} from './Transition'

import './style/Slider.scss'

export interface ISliderProps {
  className?: string
  style?: React.CSSProperties
  loop?: boolean
  start?: number
  direction?: 'horizontal' | 'vertical'
  animation?: string
  offset?: number
  afterChange?: (to: number) => void
  beforeChange?: (from: number) => void
}

export class Slider extends React.PureComponent<ISliderProps, any> {
  static defaultProps = {
    loop: false,
    start: 0,
    direction: 'vertical',
    animation: 'move',
    offset: 20
  }

  isSliding = false

  state = {
    total: React.Children.toArray(this.props.children).length,
    reverse: false,
    currentSlide: this.props.start as number
  }

  private slider: HTMLDivElement | null
  private canSlideNext: boolean
  private canSlidePrev: boolean

  slideTo(index: number, reverse: boolean | null = null) {
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

    return {height, width, display: 'block'}
  }

  private get child(): React.ReactNode {
    let {children, animation} = this.props
    let {slideStyle} = this
    let child: any = React.Children.toArray(children)[this.state.currentSlide]

    return (
      <TransitionGroupItem
          key={child.key || this.state.currentSlide}
          name={animation as string}
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
    let {direction, className, style} = this.props
    let {reverse, total} = this.state
    let cls = reverse ? 'wSliderReverse ' + direction + 'Reverse' : 'wSliderNormal ' + direction

    return (
      <Finger onSwipe={this.onSwipe}>
        <div ref={s => this.slider = s} style={style} className={className}>
          {total === 0 ? null : (
            <TransitionGroup component='div' className={classSet('wSlider', cls)} onTouchStart={this.onTouchStart}>
              {this.child}
            </TransitionGroup>
          )}
        </div>
      </Finger>
    )
  }

  @autobind private beforeChildEnter(el: HTMLSpanElement) {
    this.isSliding = true
    el.classList.add('current')
    if (this.props.beforeChange) this.props.beforeChange(this.state.currentSlide - 1)
  }

  @autobind private afterChildEnter(el: HTMLSpanElement) {
    this.isSliding = false
    if (this.props.afterChange) this.props.afterChange(this.state.currentSlide)
  }

  @autobind private beforeChildLeave(el: HTMLSpanElement) {
    el.classList.remove('current')
  }

  @autobind private onTouchStart() {
    if (!this.slider) return
    let container = this.slider.children[0].children[0]
    let {clientHeight: containerHeight, clientWidth: containerWidth, scrollTop, scrollLeft} = container
    let {clientHeight: childHeight, clientWidth: childWidth} = container.children[0]

    let {offset, direction} = this.props as any
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

  @autobind private onSwipe(e: any) {
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
