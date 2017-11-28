// @flow
import * as SafeAPIServer from "../../src/server";
import * as API from "shared/api";
import Koa from "koa";

export function main() {
  const app = new Koa();
  app.use(
    SafeAPIServer.safeGet(API.hello, async () => {
      return "world";
    })
  );
  const server = app.listen(8080);
  return server;
}
