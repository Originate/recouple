// @flow

export type StringExpansion<O> = (first: string | Array<string>, ...args: Array<any>) => O;

export function stringExpansion<O>(f: string => O): StringExpansion<O> {
  return (first, ...args) => {
    if (typeof first === "string") {
      return f(first);
    } else {
      const strings = first;
      const values = args;
      const result = [strings[0]];
      values.forEach((value, i) => result.push(value, strings[i + 1]));
      return f(result.join(""));
    }
  };
}
