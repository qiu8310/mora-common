declare var px2rem: (px: number) => number
declare var rem2px: (rem: number) => number
declare var p2r: (px: number | string) => string
declare var responsive: () => void
declare var meta: {
  dpr: number
  hairlines: boolean
}

interface ResponsiveWindow {
  px2rem: (px: number) => number
  rem2px: (rem: number) => number
  p2r: (px: number | string) => string
  responsive: () => void
  meta: {
    dpr: number
    hairlines: boolean
  }
}

interface Window extends ResponsiveWindow {}
