// @flow
import * as Recouple from "recouple";
import * as T from "recouple/lib/type_rep";
import * as RecoupleFetch from "recouple-fetch";
import * as TestUtils from "./test_utils";
import fetch from "isomorphic-fetch";

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

const testOptionalEndpoint: Recouple.Endpoint<
  {
    x: ?string
  },
  string
> = Recouple.endpoint()
  .fragment("foo")
  .queryParams({
    x: T.maybeString
  });

const testOptionalHandler = async input => {
  return input.x || "";
};

describe("for an endpoint with optional queryString middleware", () => {
  it("can be called with a query parameter", async () => {
    const server = TestUtils.makeServer({
      endpoint: testOptionalEndpoint,
      handler: testOptionalHandler
    });
    const baseURL = `http://localhost:${server.address().port}`;
    const input = { x: "X" };
    await RecoupleFetch.safeGet(baseURL, testOptionalEndpoint, input);
    const expectedURL = `${baseURL}/foo?x=X`;
    expect(fetch).toHaveBeenLastCalledWith(expectedURL);
  });

  describe("for null parameters", () => {
    it("will serialize null parameters to the empty string", async () => {
      const server = TestUtils.makeServer({
        endpoint: testOptionalEndpoint,
        handler: testOptionalHandler
      });
      const baseURL = `http://localhost:${server.address().port}`;
      const input = { x: null };
      await RecoupleFetch.safeGet(baseURL, testOptionalEndpoint, input);
      const expectedURL = `${baseURL}/foo?x=`;
      expect(fetch).toHaveBeenLastCalledWith(expectedURL);
    });

    it("will remove undefined parameters", async () => {
      const server = TestUtils.makeServer({
        endpoint: testOptionalEndpoint,
        handler: testOptionalHandler
      });
      const baseURL = `http://localhost:${server.address().port}`;
      const input = { x: undefined };
      await RecoupleFetch.safeGet(baseURL, testOptionalEndpoint, input);
      const expectedURL = `${baseURL}/foo`;
      expect(fetch).toHaveBeenLastCalledWith(expectedURL);
    });
  });
});
