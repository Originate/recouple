// @flow
import * as SafeAPI from "safe-api";
import queryString from "querystring";
import fetch from "isomorphic-fetch";
import { TypeRep } from "safe-api/lib/type_rep";

export type ClientData<I: {}> = {
  url: string,
  queryParams: { [string]: any }
};

type ClientDataF = <I: {}>(I) => (input: I) => ClientData<I>;

const clientDataVisitor: SafeAPI.Visitor<ClientDataF> = {
  init: () => input => {
    return { url: "", queryParams: {} };
  },
  handleFragment: url => getData => input => {
    const data = getData(input);
    return {
      ...data,
      url: `${data.url}/${url}`
    };
  },
  handleQueryParams: queryParams => getData => input => {
    const data = getData(input);
    const newQueryParams = Object.assign({}, data.queryParams);
    for (const key of Object.keys(queryParams)) {
      newQueryParams[key] = input[key];
    }
    return {
      ...data,
      queryParams: newQueryParams
    };
  }
};

export function extractClientData<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I
): ClientData<I> {
  const visit: SafeAPI.Visit<ClientDataF, I> = SafeAPI.makeVisit(endpoint);
  return visit(clientDataVisitor)(input);
}

export async function safeGet<I: {}, O>(
  baseURL: string,
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I
): Promise<O> {
  const { url, queryParams } = extractClientData(endpoint, input);
  let fullUrl = `${baseURL}${url}`;
  if (Object.keys(queryParams).length > 0) {
    const querystring = queryString.stringify(queryParams);
    fullUrl = `${fullUrl}?${querystring}`;
  }
  const resp = await fetch(fullUrl);
  return resp.json();
}
