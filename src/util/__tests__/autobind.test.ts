/* tslint:disable:no-empty */
import autobind from '../autobind'

describe('decorators', () => {
  test('class', () => {
    @autobind
    class A {
      foo() { return this }
      componentDidMount() { return this }
    }

    testBind(A, ['foo'])
    testNotBind(A, ['componentDidMount'])
  })

  test('method', () => {
    class A {
      foo() { return this }
      @autobind
      componentDidMount() { return this }
    }
    testNotBind(A, ['foo'])
    testBind(A, ['componentDidMount'])
  })

  test('inherit', () => {
    @autobind
    class A { foo() {return this} }

    class B1 extends A { }
    class B2 extends A { }

    testBind(B1, ['foo'])
    testBind(B2, ['foo'])
  })

  test('overwrite', () => {
    @autobind
    class A { foo() {return 'A'} bar() {return 'A'} }
    class B extends A {
      @autobind
      foo() {return 'B'}
    }

    expect(new A().foo()).toBe('A')
    expect(new A().bar()).toBe('A')
    expect(new B().foo()).toBe('B')
    expect(new B().bar()).toBe('A')
  })

  test('overwrite and call super', () => {
    @autobind
    class A { foo() {return 'A'} }

    @autobind
    class B extends A { foo() {return super.foo() + 'B' + super.foo()} }

    expect(new B().foo()).toBe('ABA')
  })

  test('multiple bind', () => {
    @autobind
    class A {
      @autobind
      foo() {return this}
    }

    testBind(A, ['foo'])
  })
})

describe('basic', () => {
  test('auto bind return fromCtor', () => {
    class A {}
    expect(autobind(A)).toBe(A)
  })

  test('prototype call', () => {
    class A { foo() { return this } }
    autobind(A)
    expect(A.prototype.foo()).toBe(A.prototype)
  })

  test('Manual class will not bind its methods to self', () => {
    class Manual {
      foo() { return this }
      bar() { return this }
    }
    testNotBind(Manual, ['foo', 'bar'])
  })

  test('Auto class will bind all its methods to self', () => {
    class Auto {
      foo() { return this }
      bar() { return this }
    }
    autobind(Auto)
    testBind(Auto, ['foo', 'bar'])
  })

  test('OptionalAuto class will not bind foo to self', () => {
    class OptionalAuto {
      foo() { return this }
      bar() { return this }
    }
    autobind(OptionalAuto, ['foo'])

    testNotBind(OptionalAuto, ['foo'])
    testBind(OptionalAuto, ['bar'])
  })

  test('auto bind in constructor', () => {
    class A {
      constructor() { autobind(this.constructor) }
      ma() { return this }
    }
    class B extends A { mb() { return this } }
    class C extends B { mc() { return this } }

    let a = new A()
    let b = new B()
    let c = new C()

    // 因为都 new 了下，所以所有方法都会自动调整 this 对象
    testBind(a, ['ma'])
    testBind(b, ['ma', 'mb'])
    testBind(c, ['ma', 'mb', 'mc'])
  })

  test('auto bind outside', () => {
    class A { ma() { return this } }
    class B extends A { mb() { return this } }
    class C extends B { mc() { return this } }

    autobind(C, A)
    // 或
    // autobind(A)
    // autobind(B)
    // autobind(C)

    let a = new A()
    let b = new B()
    let c = new C()

    testBind(a, ['ma'])
    testBind(b, ['ma', 'mb'])
    testBind(c, ['ma', 'mb', 'mc'])
  })

  test('auto bind inherit', () => {
    class A {
      // NOTE: 这个会造成大量的重复绑定
      constructor() { autobind(this.constructor as any, A) }
      ma() { return this }
    }
    class B extends A { mb() { return this } }
    class C extends B { mc() { return this } }

    let a = new A()
    let b = new B()
    let c = new C()

    testBind(a, ['ma'])
    testBind(b, ['ma', 'mb'])
    testBind(c, ['ma', 'mb', 'mc'])
  })
})

function testBind(Ctor: any, methods: string[], bindTo: any = null) {
  let instance = Ctor.prototype ? new Ctor() : Ctor
  methods.forEach(method => {
    let fn = instance[method]
    expect(fn()).toBe(bindTo || instance)
  })
}

function testNotBind(Ctor: any, methods: string[], bindTo: any = null) {
  let instance = Ctor.prototype ? new Ctor() : Ctor
  methods.forEach(method => {
    let fn = instance[method]
    expect(fn()).not.toBe(bindTo || instance)
  })
}
