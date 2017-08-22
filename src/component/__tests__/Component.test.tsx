import * as React from 'react'
import Component from '../Component'
import * as renderer from 'react-test-renderer'

class A extends Component<any> {
  render() {
    return <div>aa</div>
  }
}

test('react', () => {
  let component = renderer.create(<A />)

  let tree = component.toJSON()
  expect(tree).toMatchSnapshot()
})
