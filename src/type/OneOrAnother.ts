type OneOrAnother<T1, T2> =
  | (T1 & { [K in keyof T2]?: undefined })
  | (T2 & { [K in keyof T1]?: undefined });

type Props = OneOrAnother<{ a: string; b: string }, {}>;

// const a: Props = { a: "a" }; // error
// const b: Props = { b: "b" }; // error
// const ab: Props = { a: "a", b: "b" }; // ok
