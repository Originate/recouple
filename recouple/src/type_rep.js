// @flow
// eslint-disable-next-line no-unused-vars
export interface TypeRep<T> {}

class StringRep implements TypeRep<string> {}
class OptionRep<T> implements TypeRep<?T> {}

export const string = new StringRep();

// eslint-disable-next-line no-unused-vars
export function option<T, Rep: TypeRep<T>>(value: Rep): TypeRep<?T> {
  return new OptionRep();
}
