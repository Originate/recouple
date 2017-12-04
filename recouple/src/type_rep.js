// @flow
export interface TypeRep<T> {}

class StringRep implements TypeRep<string> {}
class MaybeStringRep implements TypeRep<?string> {}

export const string = new StringRep();
export const maybeString = new MaybeStringRep();
