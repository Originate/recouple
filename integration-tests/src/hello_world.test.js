// @flow
import * as SafeAPI from "safe-api";
import * as SafeFetch from "safe-api-fetch";
import * as SafeKoa from "safe-api-koa";
import * as TestUtils from "./test_utils";
import Koa from "koa";
import fetch from "isomorphic-fetch";

const testEndpoint: SafeAPI.Endpoint<{}, string> = SafeAPI.endpoint()
  .fragment("hello")
  .fragment("world");

const testHandler = async () => "foo";

describe("for a GET endpoint with no parameters", () => {
  it("should be able to generate a server", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const resp = await fetch(
      `http://localhost:${server.address().port}/hello/world`
    );
    const json = await resp.json();
    expect(json).toBe("foo");
  });

  it("should be able to generate a compatible client", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const resp = await SafeFetch.safeGet(
      `http://localhost:${server.address().port}`,
      testEndpoint,
      {}
    );
    expect(resp).toBe("foo");
  });
});

// SafeKoa type tests
() => {
  const app = new Koa();

  // it permits correct output types in handlers
  // ok
  app.use(SafeKoa.safeGet(testEndpoint, async () => "foo"));

  // it rejects invalid output types in handlers
  // $FlowFixMe
  app.use(SafeKoa.safeGet(testEndpoint, async () => 1));

  // it permits correct input types in handlers
  app.use(
    SafeKoa.safeGet(testEndpoint, async input => {
      // ok
      (input: {});
      return "foo";
    })
  );

  // it rejects invalid input types in handlers
  app.use(
    SafeKoa.safeGet(testEndpoint, async input => {
      // $FlowFixMe
      (input: { foo: string });
      return "foo";
    })
  );
};

// SafeFetch type tests
() => {
  const baseURL = "http://localhost:8080";

  // it permits correct output types in handlers
  // ok
  (SafeFetch.safeGet(baseURL, testEndpoint, {}): Promise<string>);

  // it rejects invalid output types in handlers
  // $FlowFixMe
  (SafeFetch.safeGet(baseURL, testEndpoint, {}): Promise<number>);

  // it permits correct input types in handlers
  // ok
  SafeFetch.safeGet(baseURL, testEndpoint, {});
};
