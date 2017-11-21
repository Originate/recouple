// @flow

type ServerData<I: {}> = {
  url: string
};

type ClientData<I: {}> = {
  url: I => string
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
      url: input => `${clientData.url(input)}${this.urlFragment}`
    };
  }
}

export class PrependFragmentClient<I: {}> implements Middleware<I, I> {
  urlFragment: string;
  constructor(urlFragment: string) {
    this.urlFragment = urlFragment;
  }
  mapServerData(serverData: ServerData<I>): ServerData<I> {
    return serverData;
  }
  mapClientData(clientData: ClientData<I>): ClientData<I> {
    return {
      ...clientData,
      url: input => `${this.urlFragment}${clientData.url(input)}`
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

export function extractServerData<I: {}>(
  endpoint: Endpoint<I, *>
): ServerData<I> {
  if (endpoint instanceof Cons) {
    const { next, middleware } = endpoint.data;
    return middleware.mapServerData(extractServerData(next));
  } else {
    return {
      url: ""
    };
  }
}

export function extractClientData<I: {}>(
  endpoint: Endpoint<I, *>
): ClientData<I> {
  if (endpoint instanceof Cons) {
    const { next, middleware } = endpoint.data;
    return middleware.mapClientData(extractClientData(next));
  } else {
    return {
      url: () => ""
    };
  }
}
