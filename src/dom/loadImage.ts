export interface ILoadImageOptions {
  success?: (e: Event) => void
  error?: (e: ErrorEvent) => void
  complete?: () => void
}

export function loadImage(src: string, {success, error, complete}: ILoadImageOptions = {}) {
  let img = new Image()
  let successHandler = (e: Event) => {
    if (success) success(e)
    off()
  }
  let errorHandler = (e: ErrorEvent) => {
    if (error) error(e)
    off()
  }

  let off = () => {
    img.removeEventListener('load', successHandler)
    img.removeEventListener('error', errorHandler)
    if (complete) complete()
  }

  img.addEventListener('load', successHandler)
  img.addEventListener('error', errorHandler)
  img.src = src
}
