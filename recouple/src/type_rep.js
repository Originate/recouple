// @flow
export interface TypeRep<T> {
  deserialize(input: ?string): T;
}

class StringRep implements TypeRep<string> {
  deserialize(input: ?string): string {
    if (input == null) {
      throw new Error("cannot deserialize null to string");
    }
    return input;
  }
}

class NumRep implements TypeRep<number> {
  deserialize(input: ?string): number {
    if (input == null) {
      throw new Error("cannot deserialize null to number");
    }
    const num = Number.parseInt(input);
    if (isNaN(num)) {
      throw new Error("cannot parse number");
    }
    return num;
  }
}

class OptionRep<T> implements TypeRep<?T> {
  inner: TypeRep<T>;
  constructor(inner: TypeRep<T>) {
    this.inner = inner;
  }
  deserialize(input: ?string): ?T {
    if (input == null) {
      return input;
    }
    return this.inner.deserialize(input);
  }
}

export const string = new StringRep();
export const number = new NumRep();

export function option<T, Rep: TypeRep<T>>(value: Rep): TypeRep<?T> {
  return new OptionRep(value);
}
