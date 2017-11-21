// @flow
import * as SafeAPI from "./";
import KoaRoute from "koa-route";

type Handler<I: {}, O> = I => Promise<O>;

export function safeGet<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>,
  handler: Handler<I, O>
) {
  const { url } = SafeAPI.extractServerData(endpoint);
  return KoaRoute.get(url, async (context, next) => {
    const input: any = {};
    const output = await handler(input);
    context.type = "application/json";
    context.body = JSON.stringify(output);
    await next();
  });
}
