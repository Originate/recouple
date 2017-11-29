// @flow
import { TypeRep } from "./type_rep";

interface Middleware<I_old: {}, I: {}> {
  /*
   Our visitors use higher-kinded types so that their result type can depend on the
   input of type I. Those are encoded as follows in Flow:

   The higher-kinded type (F : * -> *) is encoded as the function type <A>(A) => F(A).
   The kind (* -> *) itself is encoded as the Function type.
   For the type-level application (F A) we use $Call<F, A>.

   The support for the conversion rule is not full, so some explicit fiddling
   might be needed to get the types to work out -- look at safe-api-fetch for
   example.
  */

  _visit<DataF: Function>(
    visitor: Visitor<DataF>
  ): ($Call<DataF, I_old>) => $Call<DataF, I>;
}

export type Visitor<DataF: Function> = {|
  init: () => $Call<DataF, {}>,
  handleFragment: string => <I: {}>(
    previous: $Call<DataF, I>
  ) => $Call<DataF, I>,
  handleQueryParams: <P: {}>(
    P
  ) => <I: {}>($Call<DataF, I>) => $Call<DataF, $Merge<I, $ExtractTypes<P>>>
|};

export class Fragment<I: {}> implements Middleware<I, I> {
  urlFragment: string;
  constructor(urlFragment: string) {
    this.urlFragment = urlFragment;
  }
  _visit<DataF: Function>(
    visitor: Visitor<DataF>
  ): ($Call<DataF, I>) => $Call<DataF, I> {
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
  _visit<DataF: Function>(
    visitor: Visitor<DataF>
  ): ($Call<DataF, I>) => $Call<DataF, $Merge<I, $ExtractTypes<P>>> {
    return visitor.handleQueryParams(this.params);
  }
}

export interface Endpoint<I: {}, O> {
  _visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, I>;
  append<I_new: {}>(middleware: Middleware<I, I_new>): Endpoint<I_new, O>;
  fragment(urlFragment: string): Endpoint<I, O>;
  queryParams<P: {}>(params: P): Endpoint<$Merge<I, $ExtractTypes<P>>, O>;
}

export class EndpointImpl<I: {}, O> implements Endpoint<I, O> {
  constructor() {}

  _visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, I> {
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

  _visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, I> {
    const { previous, middleware } = this.data;
    return middleware._visit(visitor)(previous._visit(visitor));
  }
}

export class Nil<O> extends EndpointImpl<{}, O> {
  _visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, {}> {
    return visitor.init();
  }
}

export function endpoint<O>(): Endpoint<{}, O> {
  return new Nil();
}

export type Visit<DataF: Function, I> = (Visitor<DataF>) => $Call<DataF, I>;

export function makeVisit<I: {}, O>(endpoint: Endpoint<I, O>): Visit<*, I> {
  return endpoint._visit.bind(endpoint);
}
