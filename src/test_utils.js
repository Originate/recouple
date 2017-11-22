// @flow
import * as SafeAPI from "../";
import * as Server from "./server";
import Koa from "koa";

jest.mock("isomorphic-fetch", () => {
  const fetch = (require: any).requireActual("isomorphic-fetch");
  return jest.fn(fetch);
});

jest.resetAllMocks();

const _cleanupFns: Array<() => any> = [];
afterEach(() => {
  while (_cleanupFns.length > 0) {
    const fn = _cleanupFns.pop();
    fn();
  }
});

export function cleanupWith(fn: () => any) {
  _cleanupFns.push(fn);
}

export function makeServer<I: {}, O>(data: {
  endpoint: SafeAPI.Endpoint<I, O>,
  handler: Server.Handler<I, O>
}) {
  const { endpoint, handler } = data;
  const app = new Koa();
  app.use(Server.safeGet(endpoint, handler));
  const server = app.listen();
  cleanupWith(() => server.close());
  return server;
}
