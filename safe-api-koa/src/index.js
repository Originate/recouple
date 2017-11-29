// @flow
import * as SafeAPI from "safe-api";
import { TypeRep } from "safe-api/lib/type_rep";
import type { Middleware as KoaMiddleware } from "koa";
import KoaRoute from "koa-route";
import queryString from "querystring";

export type Handler<I: {}, O> = I => Promise<O>;

export type ServerData<I: {}> = {
  url: string,
  queryParams: { [string]: TypeRep<any> }
};

type ServerDataF = <I: {}>(I) => ServerData<I>;

const serverDataVisitor: SafeAPI.Visitor<ServerDataF> = {
  init: () => {
    return { url: "", queryParams: {} };
  },
  handleFragment: url => data => {
    return {
      ...data,
      url: `${data.url}/${url}`
    };
  },
  handleQueryParams: queryParams => data => {
    return {
      ...data,
      queryParams: { ...data.queryParams, ...queryParams }
    };
  }
};

export function extractServerData<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>
): ServerData<I> {
  const visit: SafeAPI.Visit<ServerDataF, I> = SafeAPI.makeVisit(endpoint);
  return visit(serverDataVisitor);
}

export function safeGet<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>,
  handler: Handler<I, O>
): KoaMiddleware {
  const { url, queryParams: queryParamsRep } = extractServerData(endpoint);
  return KoaRoute.get(url, async (context, next) => {
    const input: any = {};

    const rawQueryParams = queryString.parse(context.request.querystring);
    for (const key of Object.keys(queryParamsRep)) {
      input[key] = rawQueryParams[key];
    }

    const output = await handler(input);
    context.type = "application/json";
    context.body = JSON.stringify(output);
    await next();
  });
}