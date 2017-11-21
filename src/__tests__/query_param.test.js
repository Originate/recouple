// @flow
import * as SafeAPI from "../";
import * as Client from "../client";
import * as Server from "../server";
import * as TestUtils from "../test_utils";
import fetch from "isomorphic-fetch";
import Koa from "koa";

const testEndpoint: SafeAPI.Endpoint<
  {
    first: string,
    last: string
  },
  {
    first: string,
    last: string,
    full: string
  }
> = new SafeAPI.Snoc({
  previous: new SafeAPI.Snoc({
    previous: new SafeAPI.Nil(),
    middleware: new SafeAPI.Fragment("foo")
  }),
  middleware: new SafeAPI.QueryParams({
    first: new SafeAPI.StringRep(),
    last: new SafeAPI.StringRep()
  })
});

const testHandler = async input => {
  return {
    first: input.first,
    last: input.last,
    full: `${input.first} ${input.last}`
  };
};

describe("for a GET endpoint with no parameters", () => {
  it("should be able to generate a server", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const resp = await fetch(
      `http://localhost:${server.address().port}/foo?first=First&last=Last`
    );
    const json = await resp.json();
    expect(json).toEqual({
      first: "First",
      last: "Last",
      full: "First Last"
    });
  });

  it("should be able to generate a compatible client", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const resp = await Client.safeGet(
      `http://localhost:${server.address().port}`,
      testEndpoint,
      {
        first: "First",
        last: "Last"
      }
    );
    expect(resp).toEqual({
      first: "First",
      last: "Last",
      full: "First Last"
    });
  });
});

// Server type tests
() => {
  const app = new Koa();

  // it permits correct output types in handlers
  // ok
  app.use(
    Server.safeGet(testEndpoint, async () => ({
      first: "",
      last: "",
      full: ""
    }))
  );

  // it rejects invalid output types in handlers
  // $FlowFixMe
  app.use(Server.safeGet(testEndpoint, async () => ({ first: "", last: "" })));

  // it permits correct input types in handlers
  app.use(
    Server.safeGet(testEndpoint, async input => {
      // ok
      (input: { first: string, last: string });
      return { first: "", last: "", full: "" };
    })
  );

  // it rejects invalid input types in handlers
  app.use(
    Server.safeGet(testEndpoint, async input => {
      // $FlowFixMe
      (input: { first: string, last: string, asdf: number });
      return { first: "", last: "", full: "" };
    })
  );
};

// Client type tests
() => {
  const baseURL = "http://localhost:8080";

  // it permits correct output types in handlers
  // ok
  (Client.safeGet(baseURL, testEndpoint, { first: "", last: "" }): Promise<{
    first: string,
    last: string,
    full: string
  }>);

  // it rejects invalid output types in handlers
  // $FlowFixMe
  (Client.safeGet(baseURL, testEndpoint, { first: "", last: "" }): Promise<{
    first: string,
    last: string,
    NotFull: number
  }>);

  // it permits correct input types in handlers
  // ok
  Client.safeGet(baseURL, testEndpoint, { first: "", last: "" });
};
