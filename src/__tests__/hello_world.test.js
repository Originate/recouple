// @flow
import * as SafeAPI from "../";
import * as Client from "../client";
import * as Server from "../server";
import * as TestUtils from "../test_utils";
import Koa from "koa";
import fetch from "isomorphic-fetch";

function makeSafeServer(): {
  server: *,
  endpoint: SafeAPI.Endpoint<{}, string>
} {
  const endpoint: SafeAPI.Endpoint<{}, string> = SafeAPI.endpoint`hello`.fragment`world`;
  const app = new Koa();
  app.use(
    Server.safeGet(endpoint, async () => {
      return "foo";
    })
  );
  const server = app.listen();
  TestUtils.cleanupWith(() => server.close());
  return { server, endpoint };
}

describe("for a GET endpoint with no parameters", () => {
  it("should be able to generate a server", async () => {
    const { server } = makeSafeServer();
    const resp = await fetch(
      `http://localhost:${server.address().port}/hello/world`
    );
    const json = await resp.json();
    expect(json).toBe("foo");
  });

  it("should be able to generate a compatible client", async () => {
    const { server, endpoint } = makeSafeServer();
    const resp = await Client.safeGet(
      `http://localhost:${server.address().port}`,
      endpoint,
      {}
    );
    expect(resp).toBe("foo");
  });
});

// Server type tests
() => {
  const endpoint: SafeAPI.Endpoint<{}, string> = SafeAPI.endpoint`hello`.fragment`world`;
  const app = new Koa();

  // it permits correct output types in handlers
  // ok
  app.use(Server.safeGet(endpoint, async () => "foo"));

  // it rejects invalid output types in handlers
  // $FlowFixMe
  app.use(Server.safeGet(endpoint, async () => 1));

  // it permits correct input types in handlers
  app.use(
    Server.safeGet(endpoint, async input => {
      // ok
      (input: {});
      return "foo";
    })
  );

  // it rejects invalid input types in handlers
  app.use(
    Server.safeGet(endpoint, async input => {
      // $FlowFixMe
      (input: { foo: string });
      return "foo";
    })
  );
};

// Client type tests
() => {
  const baseURL = "http://localhost:8080";
  const endpoint: SafeAPI.Endpoint<{}, string> = SafeAPI.endpoint`hello`.fragment`world`;

  // it permits correct output types in handlers
  // ok
  (Client.safeGet(baseURL, endpoint, {}): Promise<string>);

  // it rejects invalid output types in handlers
  // $FlowFixMe
  (Client.safeGet(baseURL, endpoint, {}): Promise<number>);

  // it permits correct input types in handlers
  // ok
  Client.safeGet(baseURL, endpoint, {});
};
