// @flow
import { TypeRep } from "./type_rep";

interface Middleware<I_old: {}, I: {}> {
  visit<Data>(visitor: Visitor<Data>): Data => Data;
}

export type Visitor<Data> = {|
  handleFragment: (urlFragment: string) => (previous: Data) => Data,
  handleQueryParams: <P: {}>(queryParams: P) => (previous: Data) => Data,
  handleNil: () => Data
|};

export class Fragment<I: {}> implements Middleware<I, I> {
  urlFragment: string;
  constructor(urlFragment: string) {
    this.urlFragment = urlFragment;
  }
  visit<Data>(visitor: Visitor<Data>): Data => Data {
    return visitor.handleFragment(this.urlFragment);
  }
}

type $Merge<A: {}, B: {}> = { ...$Exact<A>, ...$Exact<B> };
type $ExtractTypes<O: {}> = $ObjMap<O, <V>(TypeRep<V>) => V>;

export class QueryParams<I: {}, P: {}>
  implements Middleware<I, $Merge<I, $ExtractTypes<P>>> {
  params: P;
  constructor(params: P) {
    this.params = params;
  }
  visit<Data>(visitor: Visitor<Data>): Data => Data {
    return visitor.handleQueryParams(this.params);
  }
}

export interface Endpoint<I: {}, O> {
  visit<Data>(visitor: Visitor<Data>): Data;
  append<I_new: {}>(middleware: Middleware<I, I_new>): Endpoint<I_new, O>;
  fragment(urlFragment: string): Endpoint<I, O>;
  queryParams<P: {}>(params: P): Endpoint<$Merge<I, $ExtractTypes<P>>, O>;
}

export class EndpointImpl<I: {}, O> implements Endpoint<I, O> {
  constructor() {}

  visit<Data>(visitor: Visitor<Data>): Data {
    throw "abstract method";
  }

  append<I_new: {}>(middleware: Middleware<I, I_new>): Endpoint<I_new, O> {
    return new Snoc({ previous: this, middleware });
  }

  fragment(urlFragment: string): Endpoint<I, O> {
    return this.append(new Fragment(urlFragment));
  }

  queryParams<P: {}>(params: P): Endpoint<$Merge<I, $ExtractTypes<P>>, O> {
    return this.append(new QueryParams(params));
  }
}

type SnocData<I_old: {}, O_old, I: {}> = {
  previous: Endpoint<I_old, O_old>,
  middleware: Middleware<I_old, I>
};

export class Snoc<I_old: {}, O_old, I: {}, O> extends EndpointImpl<I, O> {
  data: SnocData<I_old, O_old, I>;
  constructor(data: SnocData<I_old, O_old, I>) {
    super();
    this.data = data;
  }

  visit<Data>(visitor: Visitor<Data>): Data {
    const { previous, middleware } = this.data;
    return middleware.visit(visitor)(previous.visit(visitor));
  }
}

export class Nil<O> extends EndpointImpl<{}, O> {
  visit<Data>(visitor: Visitor<Data>): Data {
    return visitor.handleNil();
  }
}

export function endpoint<O>(): Endpoint<{}, O> {
  return new Nil();
}
