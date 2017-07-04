export default function loadScript(url: string, callback?: () => void) {
  let script = document.createElement('script')
  script.src = url
  script.type = 'text/javascript'
  script.onload = function() {
    script.onload = null
    script.parentNode.removeChild(script)
    if (callback) callback()
  }

  // sync way of adding script tags to the page
  document.body.appendChild(script)
}
