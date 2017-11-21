// @flow
import * as SafeAPI from "./";

export async function safeGet<I: {}, O>(
  endpoint: SafeAPI.Endpoint<I, O>,
  input: I
): Promise<O> {
  const clientData = SafeAPI.extractClientData(endpoint);
  const url = clientData.url(input);
  const resp = await fetch(url);
  return resp.json();
}
