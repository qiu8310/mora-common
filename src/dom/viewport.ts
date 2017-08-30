let viewport = {width: 0, height: 0}

function setViewport() {
  viewport.width = window.innerWidth || document.documentElement.clientWidth
  viewport.height = window.innerHeight || document.documentElement.clientHeight
}

setViewport()
window.addEventListener('resize', setViewport)

export default viewport
