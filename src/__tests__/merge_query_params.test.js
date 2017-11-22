// @flow
import * as SafeAPI from "../";
import * as Client from "../client";
import * as TestUtils from "../test_utils";
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
    x: new SafeAPI.StringRep()
  })
  .queryParams({
    y: new SafeAPI.StringRep()
  });

const testHandler = async (input) => {
  (input: { x: string, y: string });
  return "foo";
};

describe("for an endpoint with multiple queryString middleware", () => {
  it("merges the two queryString objects", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const baseURL = `http://localhost:${server.address().port}`;
    const input = { x: "X", y: "Y" };
    await Client.safeGet(
      baseURL,
      testEndpoint,
      input
    );
    const expectedURL = `${baseURL}/foo?x=X&y=Y`;
    expect(fetch).toHaveBeenLastCalledWith(expectedURL);
  });
});