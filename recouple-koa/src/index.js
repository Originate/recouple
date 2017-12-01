// @flow
import * as Recouple from "recouple";
import { TypeRep } from "recouple/lib/type_rep";
import type { Middleware as KoaMiddleware } from "koa";
import KoaRoute from "koa-route";
import queryString from "querystring";

export type Handler<I: {}, O> = I => Promise<O>;

// eslint-disable-next-line no-unused-vars
export type ServerData<I: {}> = {
  url: string,
  queryParams: { [string]: TypeRep<any> },
  captureParams: Array<string>
};

type ServerDataF = <I: {}>(I) => ServerData<I>;

const serverDataVisitor: Recouple.Visitor<ServerDataF> = {
  init: () => {
    return { url: "", queryParams: {}, captureParams: [] };
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
  },
  handleCaptureParam: captureParam => data => {
    const paramName = Object.keys(captureParam)[0];
    return {
      ...data,
      url: `${data.url}/:${paramName}`,
      captureParams: [...data.captureParams, paramName]
    };
  }
};

export function extractServerData<I: {}, O>(
  endpoint: Recouple.Endpoint<I, O>
): ServerData<I> {
  const visit: Recouple.Visit<ServerDataF, I> = Recouple.makeVisit(endpoint);
  return visit(serverDataVisitor);
}

export function safeGet<I: {}, O>(
  endpoint: Recouple.Endpoint<I, O>,
  handler: Handler<I, O>
): KoaMiddleware {
  const data = extractServerData(endpoint);
  return KoaRoute.get(data.url, async (context, ...args: Array<any>) => {
    const input: any = {};
    const lastIndex = data.captureParams.length;
    const next = args[lastIndex];

    const rawQueryParams = queryString.parse(context.request.querystring);
    for (const key of Object.keys(data.queryParams)) {
      input[key] = rawQueryParams[key];
    }
    data.captureParams.forEach((key, index) => {
      input[key] = args[index];
    });

    const output = await handler(input);
    context.type = "application/json";
    context.body = JSON.stringify(output);
    await next();
  });
}
