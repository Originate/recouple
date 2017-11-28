import * as SafeAPI from "./";
import queryString from "querystring";
import fetch from "isomorphic-fetch";

export async function safeGet<I: {}, O>(
  baseURL: string,
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I
): Promise<O> {
  const clientData: SafeAPI.ClientData<I> = SafeAPI.extractClientData(endpoint);
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
