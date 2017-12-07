// 只列出常用的，所有的可以参考项目 https://github.com/timoxley/keycode
export interface IKeyCodeExpands {
  a: number; b: number; c: number; d: number; e: number; f: number; g: number; h: number; i: number; j: number; k: number; l: number; m: number; n: number; o: number; p: number; q: number; r: number; s: number; t: number; u: number; v: number; w: number; x: number; y: number; z: number
  0: number; 1: number; 2: number; 3: number; 4: number; 5: number; 6: number; 7: number; 8: number; 9: number
}

function expand<T extends {[key: string]: number}>(codes: T): T & IKeyCodeExpands {
  let i
  // lower case chars
  for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

  // numbers
  for (i = 48; i < 58; i++) codes[i - 48] = i

  return codes as any
}

// 不要出现重复的 value
export const FunctionKeyCode = {
  backspace: 8,
  tab: 9,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  esc: 27,
  space: 32,
  pgup: 33,
  pgdn: 34,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  insert: 45,
  delete: 46,

  // windows: 91,
  // command: 91,
  // leftCommand: 91,
  lmeta: 91,
  // rightCommand: 93,
  rmeta: 93,

  f1: 112, f2: 113, f3: 114, f4: 115, f5: 116, f6: 117, f7: 118, f8: 119, f9: 120, f10: 121, f11: 122
}

export const PrintKeyCode = expand({
  ';': 186,
  '=': 187,
  ',': 188,
  '-': 189,
  '.': 190,
  '/': 191,
  '`': 192,
  '[': 219,
  '\\': 220,
  ']': 221,
  '"': 222
})

export const KeyCode = {...FunctionKeyCode, ...PrintKeyCode}
