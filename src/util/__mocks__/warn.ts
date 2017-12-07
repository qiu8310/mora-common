let calledWithes: any[] = []

export function warn(...args: any[]) {
  calledWithes.push(args)
  return args
}

(warn as any).mock = (fn: () => void, expectedCalledWithes: any[]) => {
  calledWithes = []
  fn()
  if (expectedCalledWithes) expect(calledWithes).toEqual(expectedCalledWithes)
}
