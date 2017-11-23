// @flow
import { TypeRep } from "./type_rep";

export type Visitor<Data> = {|
  handleFragment: (urlFragment: string) => (previous: Data) => Data,
  handleQueryParams: <P: {}>(queryParams: P) => (previous: Data) => Data,
  handleNil: () => Data
|};

// type MiddlewareMono = Middleware<*, *, *>;

export function visitMiddleware<Data>(
  visitor: Visitor<Data>,
  middleware: Middleware<*, *, *>
): Data => Data {
  {
    const m = (middleware: Middleware<*, *, *>);
    if (m instanceof Fragment) {
      return visitor.handleFragment(m.payload);
    }
  }
  {
    const m = (middleware: Middleware<*, *, *>);
    if (m instanceof QueryParams) {
      return visitor.handleQueryParams(m.payload);
    }
  }
  throw "no other case";
}

export function visitEndpoint<Data, I: {}, O>(
  visitor: Visitor<Data>,
  endpoint: Endpoint<I, O>
): Data {
  if (endpoint instanceof Snoc) {
    const { previous, middleware } = endpoint.data;
    return visitMiddleware(visitor, middleware)(
      visitEndpoint(visitor, previous)
    );
  } else {
    return visitor.handleNil();
  }
}

class Middleware<I_old: {}, I: {}, Payload> {
  payload: Payload;
  constructor(payload: Payload) {
    this.payload = payload;
  }
}

export class Fragment<I: {}> extends Middleware<I, I, string> {}

type $Merge<A: {}, B: {}> = { ...$Exact<A>, ...$Exact<B> };
type $ExtractTypes<O: {}> = $ObjMap<O, <V>(TypeRep<V>) => V>;

export class QueryParams<I: {}, P: {}> extends Middleware<
  I,
  $Merge<I, $ExtractTypes<P>>,
  P
> {}

export interface Endpoint<I: {}, O> {
  append<I_new: {}>(middleware: Middleware<I, I_new, *>): Endpoint<I_new, O>;
  fragment(urlFragment: string): Endpoint<I, O>;
  queryParams<P: {}>(params: P): Endpoint<$Merge<I, $ExtractTypes<P>>, O>;
}

export class EndpointImpl<I: {}, O> implements Endpoint<I, O> {
  constructor() {}
  append<I_new: {}>(middleware: Middleware<I, I_new, *>): Endpoint<I_new, O> {
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
  middleware: Middleware<I_old, I, *>
};

export class Snoc<I_old: {}, O_old, I: {}, O> extends EndpointImpl<I, O> {
  data: SnocData<I_old, O_old, I>;
  constructor(data: SnocData<I_old, O_old, I>) {
    super();
    this.data = data;
  }
}

export class Nil<O> extends EndpointImpl<{}, O> {}

export function endpoint<O>(): Endpoint<{}, O> {
  return new Nil();
}
