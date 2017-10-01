let calledWithes = []

export function warn(...args) {
  calledWithes.push(args)
  return args
}

(warn as any).mock = (fn, expectedCalledWithes) => {
  calledWithes = []
  fn()
  if (expectedCalledWithes) expect(calledWithes).toEqual(expectedCalledWithes)
}
