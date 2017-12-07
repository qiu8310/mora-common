import * as React from 'react'
import {Point} from '../type/Object'
// from AlloyFinger

export interface IFingerProps {
  onTouchCancel?: (e: any) => void
  onMultipointStart?: (e: any) => void
  onMultipointEnd?: (e: any) => void
  onTap?: (e: any) => void
  onDoubleTap?: (e: any) => void
  onLongTap?: (e: any) => void
  onSingleTap?: (e: any) => void
  onRotate?: (e: any) => void
  onPinch?: (e: any) => void
  onPressMove?: (e: any) => void
  onSwipe?: (e: any) => void
}

export class Finger extends React.Component<IFingerProps, any> {
  public tapTimeout: NodeJS.Timer
  public longTapTimeout: NodeJS.Timer
  public swipeTimeout: NodeJS.Timer

  public preV: {x: number | null, y: number | null} = { x: null, y: null }
  public preTapPosition: {x: number | null, y: number | null} = { x: null, y: null }
  public pinchStartLen: number | null = null
  public scale: number = 1
  public isDoubleTap: boolean = false
  public delta: number | null = null
  public last: number | null = null
  public now: number | null = null
  public x1: number | null = null
  public x2: number | null = null
  public y1: number | null = null
  public y2: number | null = null

  getLen(v: Point) {
    return Math.sqrt(v.x * v.x + v.y * v.y)
  }

  dot(v1: Point, v2: Point) {
    return v1.x * v2.x + v1.y * v2.y
  }

  getAngle(v1: Point, v2: Point) {
    let mr = this.getLen(v1) * this.getLen(v2)
    if (mr === 0) return 0
    let r = this.dot(v1, v2) / mr
    if (r > 1) r = 1
    return Math.acos(r)
  }

  cross(v1: Point, v2: Point) {
    return v1.x * v2.y - v2.x * v1.y
  }

  getRotateAngle(v1: Point, v2: Point) {
    let angle = this.getAngle(v1, v2)
    if (this.cross(v1, v2) > 0) {
      angle *= -1
    }

    return angle * 180 / Math.PI
  }

  _resetState() {
    this.setState({ x: null, y: null, swiping: false, start: 0 })
  }

  _emitEvent(name: string, e: any) {
    let fn = (this.props as any)[name]
    if (fn) fn(e)
  }

  _handleTouchStart(evt: React.TouchEvent<any>) {
    evt.persist()
    this.now = Date.now()
    this.x1 = evt.touches[0].pageX
    this.y1 = evt.touches[0].pageY
    this.delta = this.now - (this.last || this.now)
    if (this.preTapPosition.x !== null && this.preTapPosition.y !== null) {
      this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30)
    }
    this.preTapPosition.x = this.x1
    this.preTapPosition.y = this.y1
    this.last = this.now
    let preV = this.preV
    let len = evt.touches.length
    if (len > 1) {
      let v = { x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1 }
      preV.x = v.x
      preV.y = v.y
      this.pinchStartLen = this.getLen(preV as Point)
      this._emitEvent('onMultipointStart', evt)
    }
    this.longTapTimeout = setTimeout(() => {
      this._emitEvent('onLongTap', evt)
    }, 750)
  }

  _handleTouchMove(evt: any) {
    evt.persist()
    let preV = this.preV
    let len = evt.touches.length
    let currentX = evt.touches[0].pageX
    let currentY = evt.touches[0].pageY
    this.isDoubleTap = false
    if (len > 1) {
      let v = { x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY }

      if (preV.x !== null) {
        if (this.pinchStartLen && this.pinchStartLen > 0) {
          evt.scale = this.getLen(v) / this.pinchStartLen
          this._emitEvent('onPinch', evt)
        }

        evt.angle = this.getRotateAngle(v, preV as Point)
        this._emitEvent('onRotate', evt)
      }
      preV.x = v.x
      preV.y = v.y
    } else {
      if (this.x2 !== null && this.y2 !== null) {
        evt.deltaX = currentX - this.x2
        evt.deltaY = currentY - this.y2
      } else {
        evt.deltaX = 0
        evt.deltaY = 0
      }
      this._emitEvent('onPressMove', evt)
    }
    this._cancelLongTap()
    this.x2 = currentX
    this.y2 = currentY
    if (len > 1) {
      evt.preventDefault()
    }
  }

  _handleTouchCancel() {
    clearInterval(this.tapTimeout)
    clearInterval(this.longTapTimeout)
    clearInterval(this.swipeTimeout)
  }

  _handleTouchEnd(evt: any) {

    this._cancelLongTap()
    let self = this
    if (evt.touches.length < 2) {
      this._emitEvent('onMultipointEnd', evt)
    }

    let {x1, x2, y1, y2} = this as any
    if ((x2 && Math.abs(x1 - x2) > 30) ||
      (y2 && Math.abs((this.preV.y as number) - y2) > 30)) {
      evt.direction = this._swipeDirection(x1, x2, y1, y2)
      this.swipeTimeout = setTimeout(function() {
        self._emitEvent('onSwipe', evt)
      }, 0)
    } else {
      this.tapTimeout = setTimeout(function() {
        self._emitEvent('onTap', evt)
        if (self.isDoubleTap) {
          self._emitEvent('onDoubleTap', evt)
          self.isDoubleTap = false
        }
      }, 0)
    }

    this.preV.x = 0
    this.preV.y = 0
    this.scale = 1
    this.pinchStartLen = null
    this.x1 = this.x2 = this.y1 = this.y2 = null
  }

  _cancelLongTap() {
    clearTimeout(this.longTapTimeout)
  }

  _swipeDirection(x1: number, x2: number, y1: number, y2: number) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  render() {
    return React.cloneElement(React.Children.only(this.props.children), {
      onTouchStart: this._handleTouchStart.bind(this),
      onTouchMove: this._handleTouchMove.bind(this),
      onTouchCancel: this._handleTouchCancel.bind(this),
      onTouchEnd: this._handleTouchEnd.bind(this)
    })
  }
}
