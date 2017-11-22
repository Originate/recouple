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

class Middleware<I_old: {}, I: {}, Payload> {
  payload: Payload;
  constructor(payload: Payload) {
    this.payload = payload;
  }
  mapServerData(serverData: ServerData<I_old>): ServerData<I> {
    throw "hello";
  }
  mapClientData(clientData: ClientData<I_old>): ClientData<I> {
    throw "world";
  }
}

export class Fragment<I: {}> extends Middleware<I, I, string> {
  mapServerData(serverData: ServerData<I>): ServerData<I> {
    return {
      ...serverData,
      url: `${serverData.url}/${this.payload}`
    };
  }
  mapClientData(clientData: ClientData<I>): ClientData<I> {
    return {
      ...clientData,
      url: `${clientData.url}/${this.payload}`
    };
  }
}

type $Merge<A: {}, B: {}> = { ...$Exact<A>, ...$Exact<B> };
type $ExtractTypes<O: {}> = $ObjMap<O, <V>(TypeRep<V>) => V>;

export class QueryParams<I: {}, P: {}> extends Middleware<
  I,
  $Merge<I, $ExtractTypes<P>>,
  P
> {
  mapServerData(serverData: ServerData<I>): ServerData<I> {
    return {
      ...serverData,
      queryParams: { ...serverData.queryParams, ...this.payload }
    };
  }
  mapClientData(clientData: ClientData<I>): ClientData<I> {
    return {
      ...clientData,
      queryParams: { ...clientData.queryParams, ...this.payload }
    };
  }
}

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
