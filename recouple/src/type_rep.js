// @flow
// eslint-disable-next-line no-unused-vars
export interface TypeRep<T> {}

class StringRep implements TypeRep<string> {}
class NumRep implements TypeRep<number> {}
class OptionRep<T> implements TypeRep<?T> {}

export const string = new StringRep();
export const number = new NumRep();

// eslint-disable-next-line no-unused-vars
export function option<T, Rep: TypeRep<T>>(value: Rep): TypeRep<?T> {
  return new OptionRep();
}
