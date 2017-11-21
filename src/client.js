// @flow
import * as SafeAPI from "./";

export async function safeGet<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I //eslint-disable-line no-unused-vars
): Promise<O> {
  const clientData = SafeAPI.extractClientData(endpoint);
  const resp = await fetch(clientData.url);
  return resp.json();
}
