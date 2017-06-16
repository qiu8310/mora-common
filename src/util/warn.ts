export default function(...args) {
  if (console && console.warn) console.warn.apply(console, args)
}
