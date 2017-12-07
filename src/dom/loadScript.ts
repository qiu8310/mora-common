export interface ILoadScriptOptions {
  success?: (e: Event) => void
  error?: (e: Event) => void
  complete?: () => void
}

export function loadScript(url: string, {success, error, complete}: ILoadScriptOptions = {}) {
  let script = document.createElement('script') as any
  script.src = url
  script.type = 'text/javascript'
  let destroy = () => {
    script.onerror = null
    script.onload = null
    if (script.parentNode) script.parentNode.removeChild(script)
    if (complete) complete()
  }
  script.onload = function(e: Event) {
    destroy()
    if (success) success(e)
  }
  script.onerror = function(e: Event) {
    destroy()
    if (error) error(e)
  }

  // sync way of adding script tags to the page
  document.body.appendChild(script)
}
