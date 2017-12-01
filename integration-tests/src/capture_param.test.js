// @flow
import * as Recouple from "recouple";
import * as T from "recouple/lib/type_rep";
import * as RecoupleFetch from "recouple-fetch";
import * as RecoupleKoa from "recouple-koa";
import * as TestUtils from "./test_utils";
import fetch from "isomorphic-fetch";
import Koa from "koa";

const testEndpoint: Recouple.Endpoint<
  { id: string },
  { name: string }
> = Recouple.endpoint()
  .fragment("user")
  .captureParam({
    id: T.string
  });

const testUsers = { id1: "Joan", id2: "Joe" };

const testHandler = jest.fn(async input => {
  return {
    name: testUsers[input.id]
  };
});

describe("for a GET endpoint", () => {
  it("should be able to generate a server", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const resp = await fetch(
      `http://localhost:${server.address().port}/user/id1`
    );
    const json = await resp.json();
    expect(json).toEqual({ name: "Joan" });
  });

  it("should be able to generate a compatible client", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const input = { id: "id2" };
    const resp = await RecoupleFetch.safeGet(
      `http://localhost:${server.address().port}`,
      testEndpoint,
      input
    );
    expect(resp).toEqual({ name: "Joe" });
  });
});

// RecoupleKoa type tests
() => {
  const app = new Koa();

  // it permits correct output types in handlers
  // ok
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async () => ({
      name: ""
    }))
  );

  // it rejects invalid output types in handlers
  // $FlowFixMe
  app.use(RecoupleKoa.safeGet(testEndpoint, async () => ({ id: "id2" })));

  // it permits correct input types in handlers
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async input => {
      // ok
      (input: { id: string });
      return { name: "" };
    })
  );

  // it rejects invalid input types in handlers
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async input => {
      // $FlowFixMe
      (input: { id: Array<string> });
      return { name: "" };
    })
  );

  // it rejects non-existent input in handlers
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async input => {
      // $FlowFixMe
      (input: { id: string, foo: string });
      return { name: "" };
    })
  );
};

// RecoupleFetch type tests
() => {
  const baseURL = "http://localhost:8080";

  // it permits correct output types in handlers
  // ok
  (RecoupleFetch.safeGet(baseURL, testEndpoint, { id: "id2" }): Promise<{
    name: string
  }>);

  // it rejects invalid output types in handlers
  // $FlowFixMe
  (RecoupleFetch.safeGet(baseURL, testEndpoint, { id: 2 }): Promise<{
    name: string
  }>);

  // it rejects non-existent output in handlers
  // $FlowFixMe
  (RecoupleFetch.safeGet(baseURL, testEndpoint, { id: "id2" }): Promise<{
    name: string,
    age: string
  }>);

  // it permits correct input types in handlers
  // ok
  RecoupleFetch.safeGet(baseURL, testEndpoint, { id: "id2" });

  // it rejects invalid input types in handlers
  // $FlowFixMe
  RecoupleFetch.safeGet(baseURL, testEndpoint, { id: 2 });
};
