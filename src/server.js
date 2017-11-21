// @flow
import * as SafeAPI from "./";
import type { Middleware as KoaMiddleware } from "koa";
import KoaRoute from "koa-route";

export type Handler<I: {}, O> = I => Promise<O>;

export function safeGet<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>,
  handler: Handler<I, O>
): KoaMiddleware {
  const serverData: SafeAPI.ServerData<I> = SafeAPI.extractServerData(endpoint);
  const { url } = serverData;
  return KoaRoute.get(url, async (context, next) => {
    const input: any = {};
    const output = await handler(input);
    context.type = "application/json";
    context.body = JSON.stringify(output);
    await next();
  });
}
