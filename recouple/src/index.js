// @flow
import { TypeRep } from "./type_rep";

interface Middleware<OldInput: {}, Input: {}> {
  /*
   Our visitors use higher-kinded types so that their result type can depend on the
   input of type Input. Those are encoded as follows in Flow:

   The higher-kinded type (F : * -> *) is encoded as the function type <A>(A) => F(A).
   The kind (* -> *) itself is encoded as the Function type.
   For the type-level application (F A) we use $Call<F, A>.

   The support for the conversion rule is not full, so some explicit fiddling
   might be needed to get the types to work out -- look at recouple-fetch for
   example.
  */

  _visit<F: Function>(
    visitor: Visitor<F>
  ): ($Call<F, OldInput>) => $Call<F, Input>;
}

export type Visitor<F: Function> = {|
  init: () => $Call<F, {}>,
  handleFragment: string => <Input: {}>(
    previous: $Call<F, Input>
  ) => $Call<F, Input>,
  handleQueryParams: <Params: {}>(
    Params
  ) => <Input: {}>(
    $Call<F, Input>
  ) => $Call<F, $Merge<Input, $ExtractTypes<Params>>>,
  handleCaptureParam: <Params: { [string]: TypeRep<string> }>(
    Params
  ) => <Input: {}>(
    $Call<F, Input>
  ) => $Call<F, $Merge<Input, $ExtractTypes<Params>>>
|};

export class Fragment<Input: {}> implements Middleware<Input, Input> {
  urlFragment: string;
  constructor(urlFragment: string) {
    this.urlFragment = urlFragment;
  }
  _visit<F: Function>(
    visitor: Visitor<F>
  ): ($Call<F, Input>) => $Call<F, Input> {
    return visitor.handleFragment(this.urlFragment);
  }
}

type $Merge<A: {}, B: {}> = { ...$Exact<A>, ...$Exact<B> };
type $ExtractTypes<Output: {}> = $ObjMap<
  Output,
  <Field>(TypeRep<Field>) => Field
>;

export class QueryParams<Input: {}, Params: {}>
  implements Middleware<Input, $Merge<Input, $ExtractTypes<Params>>> {
  params: Params;
  constructor(params: Params) {
    this.params = params;
  }
  _visit<F: Function>(
    visitor: Visitor<F>
  ): ($Call<F, Input>) => $Call<F, $Merge<Input, $ExtractTypes<Params>>> {
    return visitor.handleQueryParams(this.params);
  }
}

export class CaptureParam<Input: {}, Params: { [string]: TypeRep<string> }>
  implements Middleware<Input, $Merge<Input, $ExtractTypes<Params>>> {
  param: Params;
  constructor(param: Params) {
    if (Object.keys(param).length != 1)
      throw new Error("CaptureParam needs a singleton object");
    this.param = param;
  }
  _visit<F: Function>(
    visitor: Visitor<F>
  ): ($Call<F, Input>) => $Call<F, $Merge<Input, $ExtractTypes<Params>>> {
    return visitor.handleCaptureParam(this.param);
  }
}

export interface Endpoint<Input: {}, Output> {
  _visit<F: Function>(visitor: Visitor<F>): $Call<F, Input>;
  append<NewInput: {}>(
    middleware: Middleware<Input, NewInput>
  ): Endpoint<NewInput, Output>;
  fragment(urlFragment: string): Endpoint<Input, Output>;
  queryParams<Params: {}>(
    params: Params
  ): Endpoint<$Merge<Input, $ExtractTypes<Params>>, Output>;
  captureParam<Params: { [string]: TypeRep<string> }>(
    param: Params
  ): Endpoint<$Merge<Input, $ExtractTypes<Params>>, Output>;
}

export class EndpointImpl<Input: {}, Output>
  implements Endpoint<Input, Output> {
  constructor() {}

  _visit<F: Function>(visitor: Visitor<F>): $Call<F, Input> {
    throw "abstract method";
  }

  append<NewInput: {}>(
    middleware: Middleware<Input, NewInput>
  ): Endpoint<NewInput, Output> {
    return new Snoc({ previous: this, middleware });
  }

  fragment(urlFragment: string): Endpoint<Input, Output> {
    return this.append(new Fragment(urlFragment));
  }

  queryParams<Params: {}>(
    params: Params
  ): Endpoint<$Merge<Input, $ExtractTypes<Params>>, Output> {
    return this.append(new QueryParams(params));
  }

  captureParam<Params: {}>(
    param: Params
  ): Endpoint<$Merge<Input, $ExtractTypes<Params>>, Output> {
    return this.append(new CaptureParam(param));
  }
}

type SnocData<OldInput: {}, OldOutput, Input: {}> = {
  previous: Endpoint<OldInput, OldOutput>,
  middleware: Middleware<OldInput, Input>
};

export class Snoc<
  OldInput: {},
  OldOutput,
  Input: {},
  Output
> extends EndpointImpl<Input, Output> {
  data: SnocData<OldInput, OldOutput, Input>;
  constructor(data: SnocData<OldInput, OldOutput, Input>) {
    super();
    this.data = data;
  }

  _visit<F: Function>(visitor: Visitor<F>): $Call<F, Input> {
    const { previous, middleware } = this.data;
    return middleware._visit(visitor)(previous._visit(visitor));
  }
}

export class Nil<Output> extends EndpointImpl<{}, Output> {
  _visit<F: Function>(visitor: Visitor<F>): $Call<F, {}> {
    return visitor.init();
  }
}

export function endpoint<Output>(): Endpoint<{}, Output> {
  return new Nil();
}

export type Visit<F: Function, Input> = (Visitor<F>) => $Call<F, Input>;

export function makeVisit<Input: {}, Output>(
  endpoint: Endpoint<Input, Output>
): Visit<*, Input> {
  return endpoint._visit.bind(endpoint);
}
