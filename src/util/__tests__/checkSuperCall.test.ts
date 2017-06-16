/* tslint:disable:no-empty */
import * as React from 'react'
import checkSuperCall from '../checkSuperCall'

jest.mock('../warn')
import warn from '../warn'
afterAll(() => jest.unmock('../warn'))

class A {
  constructor() {
    checkSuperCall(this, A, ['foo'])
  }
  foo() {}
  bar() {}
}

class B extends A {
  foo() {}
  bar() {}
  tar() {}
}

test('react extends', () => {
  let b = new B()
})

