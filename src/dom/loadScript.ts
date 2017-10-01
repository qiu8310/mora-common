export interface ILoadScriptOptions {
  success?: (e: Event) => void
  error?: (e: Event) => void
}

export function loadScript(url: string, {success, error}: ILoadScriptOptions = {}) {
  let script = document.createElement('script')
  script.src = url
  script.type = 'text/javascript'
  let destroy = () => {
    script.onerror = null
    script.onload = null
    if (script.parentNode) script.parentNode.removeChild(script)
  }
  script.onload = function(e) {
    destroy()
    if (success) success(e)
  }
  script.onerror = function(e) {
    destroy()
    if (error) error(e)
  }

  // sync way of adding script tags to the page
  document.body.appendChild(script)
}
