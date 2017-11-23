// @flow
import * as SafeAPI from "./";
import queryString from "querystring";
import fetch from "isomorphic-fetch";
import { TypeRep } from "./type_rep";

export type ClientData<I: {}> = {
  url: string,
  queryParams: { [string]: TypeRep<any> }
};

type ClientDataF = <I: {}>(I) => ClientData<I>;

const clientDataVisitor: SafeAPI.Visitor<ClientDataF> = {
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
  handleNil: () => {
    return { url: "", queryParams: {} };
  }
};

export function extractClientData<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>
): ClientData<I> {
  const clientData: $Call<ClientDataF, I> = endpoint.visit(clientDataVisitor);
  return (clientData: any);
}

export async function safeGet<I: {}, O>(
  baseURL: string,
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I
): Promise<O> {
  const { url, queryParams: queryParamsRep } = extractClientData(endpoint);
  let fullUrl = `${baseURL}${url}`;
  if (Object.keys(queryParamsRep).length > 0) {
    const queryParams = {};
    for (const key of Object.keys(queryParamsRep)) {
      const value = input[key];
      queryParams[key] = value;
    }
    const querystring = queryString.stringify(queryParams);
    fullUrl = `${fullUrl}?${querystring}`;
  }
  const resp = await fetch(fullUrl);
  return resp.json();
}
