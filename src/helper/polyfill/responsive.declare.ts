interface P2R {
  /**
   * 将 px 转化成 rem 单位
   *
   * @example
   * p2r(10)            // '1rem'
   * p2r('10px 20px')   // '1rem 2rem'
   */
  (px: number | string): string

  px2rem: (px: number) => number
  rem2px: (rem: number) => number
  responsive: () => void
  meta: {
    dpr: number
    hairlines: boolean
  }
}

interface ResponsiveWindow {
  p2r: P2R
}

interface Window extends ResponsiveWindow {}

/**
 * 将 px 转化成 rem 单位
 */
declare var p2r: P2R
