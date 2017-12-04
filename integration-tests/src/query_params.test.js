// @flow
import * as Recouple from "recouple";
import * as T from "recouple/lib/type_rep";
import * as RecoupleFetch from "recouple-fetch";
import * as RecoupleKoa from "recouple-koa";
import * as TestUtils from "./test_utils";
import fetch from "isomorphic-fetch";
import Koa from "koa";

const testEndpoint: Recouple.Endpoint<
  {
    first: string,
    last: string
  },
  {
    first: string,
    last: string,
    full: string
  }
> = Recouple.endpoint()
  .fragment("foo")
  .queryParams({
    first: T.string,
    last: T.string
  });

const testHandler = jest.fn(async input => {
  return {
    first: input.first,
    last: input.last,
    full: `${input.first} ${input.last}`
  };
});

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
    expect(json).toEqual({ first: "First", last: "Last", full: "First Last" });
  });

  it("should be able to generate a compatible client", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const input = { first: "First", last: "Last" };
    const resp = await RecoupleFetch.safeGet(
      `http://localhost:${server.address().port}`,
      testEndpoint,
      input
    );
    expect(resp).toEqual({ first: "First", last: "Last", full: "First Last" });
  });

  test("client does not serialize extraneous query params", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    const input = {
      first: "First",
      last: "Last",
      extraneous1: "extra",
      extraneous2: "extra"
    };
    const baseURL = `http://localhost:${server.address().port}`;
    await RecoupleFetch.safeGet(baseURL, testEndpoint, input);
    const expectedURL = `${baseURL}/foo?first=First&last=Last`;
    expect(fetch).toHaveBeenLastCalledWith(expectedURL);
  });

  test("server ignores extraneous query params", async () => {
    const server = TestUtils.makeServer({
      endpoint: testEndpoint,
      handler: testHandler
    });
    await fetch(
      `http://localhost:${
        server.address().port
      }/foo?first=First&last=Last&foo=Bar`
    );
    expect(testHandler).toHaveBeenLastCalledWith({
      first: "First",
      last: "Last"
    });
  });
});

const testOptionalEndpoint: Recouple.Endpoint<
  {
    x: ?string,
    y: string
  },
  {
    x: ?string,
    y: string
  }
> = Recouple.endpoint()
  .fragment("foo")
  .queryParams({
    x: T.maybeString,
    y: T.string
  });

const testOptionalHandler = async input => {
  return {
    x: input.x || null,
    y: input.y
  };
};

describe("for a GET endpoint with optional query parameters", () => {
  let server;
  beforeEach(() => {
    server = TestUtils.makeServer({
      endpoint: testOptionalEndpoint,
      handler: testOptionalHandler
    });
  });

  test("server can parse the input when present", async () => {
    const resp = await fetch(
      `http://localhost:${server.address().port}/foo?x=X&y=Y`
    );
    const json = await resp.json();
    expect(json).toEqual({ x: "X", y: "Y" });
  });

  test("server will parse null inputs", async () => {
    const resp = await fetch(
      `http://localhost:${server.address().port}/foo?x=&y=Y`
    );
    const json = await resp.json();
    expect(json).toEqual({ x: null, y: "Y" });
  });

  test("server will accept absent optional inputs", async () => {
    const resp = await fetch(
      `http://localhost:${server.address().port}/foo?y=Y`
    );
    const json = await resp.json();

    expect(json).toEqual({ x: null, y: "Y" });
  });
});

// RecoupleKoa type tests
() => {
  const app = new Koa();

  // it permits correct output types in handlers
  // ok
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async () => ({
      first: "",
      last: "",
      full: ""
    }))
  );

  // it rejects invalid output types in handlers
  app.use(
    // $FlowFixMe
    RecoupleKoa.safeGet(testEndpoint, async () => ({ first: "", last: "" }))
  );

  // it permits correct input types in handlers
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async input => {
      // ok
      (input: { first: string, last: string });
      return { first: "", last: "", full: "" };
    })
  );

  // it rejects invalid input types in handlers
  app.use(
    RecoupleKoa.safeGet(testEndpoint, async input => {
      // $FlowFixMe
      (input: { first: string, last: string, asdf: number });
      return { first: "", last: "", full: "" };
    })
  );
};

// RecoupleFetch type tests
() => {
  const baseURL = "http://localhost:8080";

  // it permits correct output types in handlers
  // ok
  (RecoupleFetch.safeGet(baseURL, testEndpoint, {
    first: "",
    last: ""
  }): Promise<{
    first: string,
    last: string,
    full: string
  }>);

  // it rejects invalid output types in handlers
  (RecoupleFetch.safeGet(baseURL, testEndpoint, {
    first: "",
    last: ""
    // $FlowFixMe
  }): Promise<{
    first: string,
    last: string,
    NotFull: number
  }>);

  // it permits correct input types in handlers
  // ok
  RecoupleFetch.safeGet(baseURL, testEndpoint, { first: "", last: "" });
};
