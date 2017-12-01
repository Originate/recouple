// @flow
import * as Recouple from "recouple";
import * as T from "recouple/lib/type_rep";
import * as RecoupleFetch from "recouple-fetch";
import * as TestUtils from "./test_utils";
import * as fetch from "isomorphic-fetch";

const testEndpoint: Recouple.Endpoint<
  {
    x: string,
    y: string
  },
  string
> = Recouple.endpoint()
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
    await RecoupleFetch.safeGet(baseURL, testEndpoint, input);
    const expectedURL = `${baseURL}/foo?x=X&y=Y`;
    expect(fetch).toHaveBeenLastCalledWith(expectedURL);
  });
});
