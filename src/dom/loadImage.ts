export interface ILoadImageOptions {
  success?: (e: Event) => void
  error?: (e: Event) => void
}

export function loadImage(src: string, options: ILoadImageOptions) {
  let img = new Image()
  let successHandler = (e: Event) => {
    if (options.success) options.success(e)
    off()
  }
  let errorHandler = (e: Event) => {
    if (options.error) options.error(e)
    off()
  }
  let off = () => {
    img.removeEventListener('load', successHandler)
    img.removeEventListener('error', errorHandler)
  }

  img.addEventListener('load', successHandler)
  img.addEventListener('error', errorHandler)
  img.src = src
}
