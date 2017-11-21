// @flow

export type ServerData<I: {}> = {
  url: string
};

export type ClientData<I: {}> = {
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

export interface Endpoint<I: {}, O> {}

type SnocData<I_old: {}, O_old, I: {}> = {
  previous: Endpoint<I_old, O_old>,
  middleware: Middleware<I_old, I>
};

export class Snoc<I_old: {}, O_old, I: {}, O> implements Endpoint<I, O> {
  data: SnocData<I_old, O_old, I>;
  constructor(data: SnocData<I_old, O_old, I>) {
    this.data = data;
  }
}

export class Nil<O> implements Endpoint<{}, O> {}

export function extractServerData<I: {}>(
  endpoint: Endpoint<I, *>
): ServerData<I> {
  if (endpoint instanceof Snoc) {
    const { previous, middleware } = endpoint.data;
    return middleware.mapServerData(extractServerData(previous));
  } else {
    return { url: "" };
  }
}

export function extractClientData<I: {}>(
  endpoint: Endpoint<I, *>
): ClientData<I> {
  if (endpoint instanceof Snoc) {
    const { previous, middleware } = endpoint.data;
    return middleware.mapClientData(extractClientData(previous));
  } else {
    return { url: "" };
  }
}
