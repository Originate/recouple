// @flow
import * as SafeAPI from "safe-api";
import * as T from "safe-api/lib/type_rep";
import * as SafeFetch from "safe-api-fetch";
import * as TestUtils from "./test_utils";
import * as fetch from "isomorphic-fetch";

const testEndpoint: SafeAPI.Endpoint<
  {
    x: string,
    y: string
  },
  string
> = SafeAPI.endpoint()
  .fragment("foo")
  .queryParams({
    x: T.string
  })
  .queryParams({
    y: T.string
  });

const testHandler = async input => {
  return `${input.x} ${input.y}`;
};

describe("for an endpoint with multiple queryString middleware", () => {
  it("merges the two queryString objects", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const baseURL = `http://localhost:${server.address().port}`;
    const input = { x: "X", y: "Y" };
    await SafeFetch.safeGet(baseURL, testEndpoint, input);
    const expectedURL = `${baseURL}/foo?x=X&y=Y`;
    expect(fetch).toHaveBeenLastCalledWith(expectedURL);
  });
});
