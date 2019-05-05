export function loadScript(url: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script') as any
    script.src = url
    script.type = 'text/javascript'

    script.onload = function() {
      destroy()
      resolve(script)
    }

    script.onerror = function(e: ErrorEvent) {
      destroy()
      reject(e)
    }

    // sync way of adding script tags to the page
    document.body.appendChild(script)

    function destroy() {
      script.onerror = null
      script.onload = null
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  })
}

export async function loadScriptConditional(url: string, shouldLoad: boolean): Promise<void> {
  if (shouldLoad) {
    await loadScript(url)
  }
}
