export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let img = new Image()
    let off = () => {
      img.removeEventListener('load', success)
      img.removeEventListener('error', error)
    }

    img.addEventListener('load', success)
    img.addEventListener('error', error)
    img.src = src

    function success() {
      off()
      resolve(img)
    }

    function error(e: ErrorEvent) {
      off()
      reject(e)
    }
  })
}
