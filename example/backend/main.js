// @flow
import * as SafeAPIServer from "safe-api/src/server";
import * as API from "example-shared/api";
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
