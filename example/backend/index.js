// @flow
import { safeGet } from "recouple-koa";
import * as API from "example-shared/api";
import Koa from "koa";

export function main() {
  const app = new Koa();
  app.use(
    safeGet(API.hello, async () => {
      return "world";
    })
  );
  app.listen(8080);
  console.log("backend started on port 8080");
}
