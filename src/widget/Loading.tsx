import * as React from 'react'

export interface ILoadingProps extends React.SVGProps<SVGSVGElement> {}

let defaultProps: ILoadingProps = {}

export class Loading extends React.PureComponent<ILoadingProps, any> {
  static setDefaultProps(props: ILoadingProps) {
    defaultProps = props
  }
  render() {
    let props = {defaultProps, ...this.props}
    return (
      <svg className='wLoading' width='38' height='38' viewBox='0 0 38 38' stroke='#fff' {...props}>
        <g fill='none' fillRule='evenodd'>
          <g transform='translate(1 1)' strokeWidth='2'>
            <circle strokeOpacity='.5' cx='18' cy='18' r='18' />
            <path d='M36 18c0-9.94-8.06-18-18-18'>
              <animateTransform
                attributeName='transform'
                type='rotate'
                from='0 18 18'
                to='360 18 18'
                dur='1s'
                repeatCount='indefinite'
              />
            </path>
          </g>
        </g>
      </svg>
    )
  }
}
