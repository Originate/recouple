// @flow
import * as Recouple from "recouple";
import queryString from "querystring";
import fetch from "isomorphic-fetch";

// eslint-disable-next-line no-unused-vars
export type ClientData<I: {}> = {
  url: string,
  queryParams: { [string]: any }
};

type ClientDataF = <I: {}>(I) => (input: I) => ClientData<I>;

const clientDataVisitor: Recouple.Visitor<ClientDataF> = {
  init: () => () => {
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
  endpoint: Recouple.Endpoint<I, O>,
  input: I
): ClientData<I> {
  const visit: Recouple.Visit<ClientDataF, I> = Recouple.makeVisit(endpoint);
  return visit(clientDataVisitor)(input);
}

export async function safeGet<I: {}, O>(
  baseURL: string,
  endpoint: Recouple.Endpoint<I, O>,
  input: I
): Promise<O> {
  const { url, queryParams } = extractClientData(endpoint, input);
  let fullUrl = `${baseURL}${url}`;
  if (Object.keys(queryParams).length > 0) {
    let definedParams = {};
    for(const prop in queryParams){
      if(queryParams[prop] !== undefined) {
        definedParams[prop] = queryParams[prop];
      }
    }
    const querystring = queryString.stringify(definedParams);
    fullUrl = `${fullUrl}?${querystring}`;
  }
  const resp = await fetch(fullUrl);
  return resp.json();
}
