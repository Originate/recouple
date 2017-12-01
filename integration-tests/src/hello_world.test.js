// @flow
import * as Recouple from "recouple";
import * as RecoupleFetch from "recouple-fetch";
import * as RecoupleKoa from "recouple-koa";
import * as TestUtils from "./test_utils";
import Koa from "koa";
import fetch from "isomorphic-fetch";

const testEndpoint: Recouple.Endpoint<{}, string> = Recouple.endpoint()
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
    const resp = await RecoupleFetch.safeGet(
      `http://localhost:${server.address().port}`,
      testEndpoint,
      {}
    );
    expect(resp).toBe("foo");
  });
});

// RecoupleKoa type tests
() => {
  const app = new Koa();

  // it permits correct output types in handlers
  // ok
  app.use(RecoupleKoa.safeGet(testEndpoint, async () => "foo"));

  // it rejects invalid output types in handlers
  // $FlowFixMe
  app.use(RecoupleKoa.safeGet(testEndpoint, async () => 1));

  // it permits correct input types in handlers
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async input => {
      // ok
      (input: {});
      return "foo";
    })
  );

  // it rejects invalid input types in handlers
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async input => {
      // $FlowFixMe
      (input: { foo: string });
      return "foo";
    })
  );
};

// RecoupleFetch type tests
() => {
  const baseURL = "http://localhost:8080";

  // it permits correct output types in handlers
  // ok
  (RecoupleFetch.safeGet(baseURL, testEndpoint, {}): Promise<string>);

  // it rejects invalid output types in handlers
  // $FlowFixMe
  (RecoupleFetch.safeGet(baseURL, testEndpoint, {}): Promise<number>);

  // it permits correct input types in handlers
  // ok
  RecoupleFetch.safeGet(baseURL, testEndpoint, {});
};
