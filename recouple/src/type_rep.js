// @flow
export interface TypeRep<T> {}

class StringRep implements TypeRep<string> {}
class NumRep implements TypeRep<number> {}
class NullRep implements TypeRep<null> {}
class UndefinedRep implements TypeRep<typeof undefined> {}
class UnionRep<A, B> implements TypeRep<A | B> {
  left: A;
  right: B;
  constructor(a: A, b: B) {
    this.left = a;
    this.right = b;
  }
}

export const string = new StringRep();
export const number = new NumRep();
export const nullValue = new NullRep();
export const undefinedValue = new UndefinedRep();

export function union<A, B, T: TypeRep<A>, U: TypeRep<B>>(
  left: T,
  right: U
): TypeRep<A | B> {
  return new UnionRep(left, right);
}

export function maybe<A, T: TypeRep<A>>(t: T): TypeRep<?A> {
  return union(t, union(nullValue, undefinedValue));
}
