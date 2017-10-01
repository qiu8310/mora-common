export function warn(...args) {
  if (console && console.warn && process.env.NODE_ENV !== 'production') console.warn.apply(console, args)
}
