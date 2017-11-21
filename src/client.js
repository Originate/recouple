// @flow
import * as SafeAPI from "./";

export async function safeGet<I: {}, O>(
  baseURL: string,
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I //eslint-disable-line no-unused-vars
): Promise<O> {
  const clientData: SafeAPI.ClientData<I> = SafeAPI.extractClientData(endpoint);
  const resp = await fetch(`${baseURL}${clientData.url}`);
  return resp.json();
}
