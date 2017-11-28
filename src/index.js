// @flow
import { TypeRep } from "./type_rep";

export type ServerData<I: {}> = {
  url: string,
  queryParams: { [string]: TypeRep<any> }
};

export type ClientData<I: {}> = {
  url: string,
  queryParams: { [string]: TypeRep<any> }
};

interface Middleware<I_old: {}, I: {}, Payload> {
  constructor(p: Payload): *;
  mapServerData(input: ServerData<I_old>): ServerData<I>;
  mapClientData(input: ClientData<I_old>): ClientData<I>;
}

export class Fragment<I: {}> implements Middleware<I, I, string> {
  urlFragment: string;
  constructor(urlFragment: string) {
    this.urlFragment = urlFragment;
  }
  mapServerData(serverData: ServerData<I>): ServerData<I> {
    return {
      ...serverData,
      url: `${serverData.url}/${this.urlFragment}`
    };
  }
  mapClientData(clientData: ClientData<I>): ClientData<I> {
    return {
      ...clientData,
      url: `${clientData.url}/${this.urlFragment}`
    };
  }
}
export function fragment<I: {}>(urlFragment: string): Fragment<I> {
  return new Fragment(urlFragment);
}

type $Merge<A: {}, B: {}> = { ...$Exact<A>, ...$Exact<B> };
type $ExtractTypes<O: {}> = $ObjMap<O, <V>(TypeRep<V>) => V>;

export class QueryParams<I: {}, P: {}>
  implements Middleware<I, $Merge<I, $ExtractTypes<P>>, P> {
  params: P;
  constructor(params: P) {
    this.params = params;
  }
  mapServerData(serverData: ServerData<I>): ServerData<I> {
    return {
      ...serverData,
      queryParams: { ...serverData.queryParams, ...this.params }
    };
  }
  mapClientData(clientData: ClientData<I>): ClientData<I> {
    return {
      ...clientData,
      queryParams: { ...clientData.queryParams, ...this.params }
    };
  }
}
export function queryParams<I: {}, P: {}>(params: P): QueryParams<I, P> {
  return new QueryParams(params);
}

/**
export interface Endpoint<I: {}, O> {
  append<I_new: {}>(middleware: Middleware<I, I_new, *>): Endpoint<I_new, O>;
  fragment(urlFragment: string): Endpoint<I, O>;
  queryParams<P: {}>(params: P): Endpoint<$Merge<I, $ExtractTypes<P>>, O>;
}

export class EndpointImpl<I: {}, O> implements Endpoint<I, O> {
  constructor() {}
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
}

export class Nil<O> extends EndpointImpl<{}, O> {}

export function extractServerData<I: {}>(
  endpoint: Endpoint<I, *>
): ServerData<I> {
  if (endpoint instanceof Snoc) {
    const { previous, middleware } = endpoint.data;
    return middleware.mapServerData(extractServerData(previous));
  } else {
    return { url: "", queryParams: {} };
  }
}

export function extractClientData<I: {}>(
  endpoint: Endpoint<I, *>
): ClientData<I> {
  if (endpoint instanceof Snoc) {
    const { previous, middleware } = endpoint.data;
    return middleware.mapClientData(extractClientData(previous));
  } else {
    return { url: "", queryParams: {} };
  }
}

export function endpoint<O>(): Endpoint<{}, O> {
  return new Nil();
}
**/

/* type Aux<I_old, I_new, M: Middleware<I_old, I_new>> = I_new;
 * type $ExtractINew<I, M> = Aux<I, *, M>;
 *
 * type Loop<E> = $ObjMap<
 *   E,
 *   <Mid>(
 *     Mid
 *   ) => <I, O>(
 *     EndpointObject<E, I, O>
 *   ) => EndpointObject<E, $ExtractINew<I, Mid>, O>
 * >;*/

/*
   Type parameter dictionary

   E := Extracted constructors object
   M := MiddlewareFns object type
   I := input type
   O := output type
*/

/*
   Constructor Extraction

   M gets extracted to E
*/

type Aux<I_old, I_new, M: Middleware<I_old, I_new, *>> = I_new;

type $ExtractINew<I, M> = Aux<I, *, M>;

type Fn<I, O> = I => O;

type ExtractedConstructorsF<M, I, O, Recursive> = $ObjMap<
  M,
  <P, Mid>(Fn<P, Mid>) => P => Endpoint<Recursive, $ExtractINew<I, Mid>, O>
>;

type ExtractedConstructors<M, I, O> = ExtractedConstructorsF<
  M,
  I,
  O,
  ExtractedConstructors<M, I, O>
>;

type PartiallyExtractedConstructorsF<M, I, O, Recursive> = (
  () => Endpoint<Recursive, I, O>
) => ExtractedConstructors<M, I, O>;

type PartiallyExtractedConstructors<M, I, O> = PartiallyExtractedConstructorsF<
  M,
  I,
  O,
  PartiallyExtractedConstructors<M, I, O>
>;

function partiallyExtractConstructors<M: {}>(
  middlewareFns: M
): PartiallyExtractedConstructors<M, *, *> {
  const extractConstructors = function<I: {}, O>(
    endpointThunk: () => Endpoint<*, I, O>
  ): ExtractedConstructors<M, I, O> {
    const constructors = {};
    for (const key of Object.keys(middlewareFns)) {
      const middlewareFn = middlewareFns[key];
      constructors[key] = payload =>
        snoc(extractConstructors, {
          previous: endpointThunk(),
          middleware: middlewareFn(payload)
        });
    }
    return constructors;
  };
  return extractConstructors;
}

/*
   Endpoints
*/

export type Endpoint<E, I: {}, O> = Snoc<E, *, *, I, O> | Nil<*, I, O>;

type SnocData<E: {}, I_old: {}, O_old, I: {}> = {
  previous: Endpoint<E, I_old, O_old>,
  middleware: Middleware<I_old, I>
};

type Snoc<E: {}, I_old: {}, O_old, I: {}, O> = {
  ...$Exact<E>,
  type: "Snoc",
  data: SnocData<E, I_old, O_old, I>
};

type Nil<E: {}, I: {}, O> = {
  ...$Exact<E>,
  type: "Nil"
};

function snoc<E: {}, I_old: {}, O_old, I: {}, O>(
  extractConstructors: PartiallyExtractedConstructors<E, I, O>,
  data: SnocData<E, I_old, O_old, I>
): Snoc<E, I_old, O_old, I, O> {
  const endpoint = {
    ...extractConstructors(() => endpoint),
    type: "Snoc",
    data
  };
  return endpoint;
}

function nil<E: {}, I: {}, O>(
  extractConstructors: PartiallyExtractedConstructors<E, I, O>
): Nil<E, I, O> {
  const endpoint = {
    ...extractConstructors(() => endpoint),
    type: "Nil"
  };
  return endpoint;
}

/*
   Endpoint Creators
*/

type EndpointCreator<M: {}> = {
  (): Endpoint<ExtractedConstructors<M, {}, *>, {}, *>,
  use: <M_additional: {}>(
    M_additional
  ) => EndpointCreator<$Merge<M, M_additional>>,
  data: M // TODO: rename
};

type CreatorSnoc = <M: {}, M_additional: {}>(
  EndpointCreator<M>,
  M_additional
) => EndpointCreator<$Merge<M, M_additional>>;
type CreatorNil = () => EndpointCreator<{}>;

// TODO: remove any
const grow: CreatorSnoc = ((last, middlewareObject) => {
  const endpointCreator = () => {
    return nil(partiallyExtractConstructors(endpointCreator.data));
  };
  endpointCreator.data = { ...last.data, ...middlewareObject };
  endpointCreator.use = nextMiddlewareObject => {
    return (grow: any)(endpointCreator, nextMiddlewareObject);
  };
  return endpointCreator;
}: any);

// TODO: remove any
export const safeAPI: CreatorNil = (() => {
  const endpointCreator = () => {
    return nil(partiallyExtractConstructors(endpointCreator.data));
  };
  endpointCreator.data = {};
  endpointCreator.use = middlewareObject => {
    return (grow: any)(endpointCreator, middlewareObject);
  };
  return endpointCreator;
}: any);
