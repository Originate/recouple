// @flow
import * as SafeAPI from "./";
import queryString from "querystring";
import fetch from "isomorphic-fetch";
import { TypeRep } from "./type_rep";

export type ClientData = {
  url: string,
  queryParams: { [string]: TypeRep<any> }
};

const clientVisitor: SafeAPI.Visitor<ClientData> = {
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

export async function safeGet<I: {}, O>(
  baseURL: string,
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I
): Promise<O> {
  const clientData: ClientData = SafeAPI.visitEndpoint(clientVisitor, endpoint);
  const { url, queryParams: queryParamsRep } = clientData;
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
