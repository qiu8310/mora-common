import {loadScript} from '../../dom/loadScript'

const fastclick = '//g.alicdn.com/mtb/??fastclick/1.0.6/fastclick.js'

export function bootstrap(options = {fastclick}) {
  if (!/(android|iphone|ipad|ipod)/i.test(navigator.userAgent)) return
  setTimeout(() => {
    loadScript(options.fastclick)
      .then(
        () => (window as any).FastClick.attach(document.body),
        (e: ErrorEvent) => console.warn('fastclick 加载失败', e)
      )
  }, 500)
}
