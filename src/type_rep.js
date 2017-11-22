// @flow
export interface TypeRep<T> {}

class StringRep implements TypeRep<string> {}
export const string = new StringRep();
