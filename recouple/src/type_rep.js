// @flow
export interface TypeRep<T> {
  deserialize(input: string): T;
}

class StringRep implements TypeRep<string> {
  deserialize(input: string): string {
    return input;
  }
}

class NumRep implements TypeRep<number> {
  deserialize(input: string): number {
    const num = Number.parseInt(input);
    if (!isNaN(num)) {
      return num;
    } else throw new Error("cannot parse number");
  }
}

class OptionRep<T> implements TypeRep<?T> {
  inner: TypeRep<T>;
  constructor(inner: TypeRep<T>) {
    this.inner = inner;
  }
  deserialize(input: string): ?T {
    if (input === "") {
      return null;
    } else {
      return this.inner.deserialize(input);
    }
  }
}

export const string = new StringRep();
export const number = new NumRep();

export function option<T, Rep: TypeRep<T>>(value: Rep): TypeRep<?T> {
  return new OptionRep(value);
}
