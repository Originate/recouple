// @flow

type ServerData<I: {}> = {
  url: string
};

type ClientData<I: {}> = {
  url: string
};

interface Middleware<I_old: {}, I: {}> {
  mapServerData(input: ServerData<I_old>): ServerData<I>;
  mapClientData(input: ClientData<I_old>): ClientData<I>;
}

export class Fragment<I: {}> implements Middleware<I, I> {
  urlFragment: string;
  constructor(urlFragment: string) {
    this.urlFragment = urlFragment;
  }
  mapServerData(serverData: ServerData<I>): ServerData<I> {
    return {
      ...serverData,
      url: `${serverData.url}${this.urlFragment}`
    };
  }
  mapClientData(clientData: ClientData<I>): ClientData<I> {
    return {
      ...clientData,
      url: `${clientData.url}${this.urlFragment}`
    };
  }
}

export interface Endpoint<I: {}, O> {}

type ConsData<I_old: {}, O_old, I: {}> = {
  middleware: Middleware<I_old, I>,
  next: Endpoint<I_old, O_old>
};

export class Cons<I_old: {}, O_old, I: {}, O> implements Endpoint<I, O> {
  data: ConsData<I_old, O_old, I>;
  constructor(data: ConsData<I_old, O_old, I>) {
    this.data = data;
  }
}

export class Nil<O> implements Endpoint<{}, O> {}

export function fold<I: {}, Result>(
  f: (Middleware<I, *>, Result) => Result
): (Endpoint<I, *>, Result) => Result {
  return (endpoint, accumulator) => {
    if (endpoint instanceof Cons) {
      const { middleware, next } = endpoint.data;
      return fold(f)(next, f(middleware, accumulator));
    } else {
      return accumulator;
    }
  };
}

export function extractServerData<I: {}>(
  endpoint: Endpoint<I, *>
): ServerData<I> {
  const getData = fold((middleware, accumulator) =>
    middleware.mapServerData(accumulator)
  );
  return getData(endpoint, { url: "" });
}

export function extractClientData<I: {}>(
  endpoint: Endpoint<I, *>
): ClientData<I> {
  const getData = fold((middleware, accumulator) =>
    middleware.mapClientData(accumulator)
  );
  return getData(endpoint, { url: "" });
}
