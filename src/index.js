// @flow
import { TypeRep } from "./type_rep";

interface Middleware<I_old: {}, I: {}> {
  /*
   Our visitors use higher-kinded types so that their result type can depend on the
   input of type I. Those are encoded as follows in Flow:

   The higher-kinded type (F : * -> *) is encoded as the function type <A>(A) => F(A).
   The kind (* -> *) itself is encoded as the Function type.
   For the type-level application (F A) we use $Call<F, A>.

   The support for the conversion rule is not full, so some explicit type-casts are needed
   when we want to view (x: $Call<F, A>) as the result of the type-level application. For example:

   type F = <A>(A) => Array<A>
   val x: $Call<F, string>
   (x: Array<string>) is not valid and will need an intermediate cast to any
  */

  visit<DataF: Function>(
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
  visit<DataF: Function>(
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
  visit<DataF: Function>(
    visitor: Visitor<DataF>
  ): ($Call<DataF, I>) => $Call<DataF, $Merge<I, $ExtractTypes<P>>> {
    return visitor.handleQueryParams(this.params);
  }
}

export interface Endpoint<I: {}, O> {
  visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, I>;
  append<I_new: {}>(middleware: Middleware<I, I_new>): Endpoint<I_new, O>;
  fragment(urlFragment: string): Endpoint<I, O>;
  queryParams<P: {}>(params: P): Endpoint<$Merge<I, $ExtractTypes<P>>, O>;
}

export class EndpointImpl<I: {}, O> implements Endpoint<I, O> {
  constructor() {}

  visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, I> {
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

  visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, I> {
    const { previous, middleware } = this.data;
    return middleware.visit(visitor)(previous.visit(visitor));
  }
}

export class Nil<O> extends EndpointImpl<{}, O> {
  visit<DataF: Function>(visitor: Visitor<DataF>): $Call<DataF, {}> {
    return visitor.init();
  }
}

export function endpoint<O>(): Endpoint<{}, O> {
  return new Nil();
}

export type Visit<DataF: Function, I> = (Visitor<DataF>) => $Call<DataF, I>;
