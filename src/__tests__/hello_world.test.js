// @flow
import * as SafeAPI from "../";
import * as Client from "../client";
import * as Server from "../server";
import * as TestUtils from "../test_utils";
import Koa from "koa";
import fetch from "isomorphic-fetch";

function makeSafeServer(): {
  server: any,
  endpoint: SafeAPI.Endpoint<{}, string>
} {
  const endpoint: SafeAPI.Endpoint<{}, string> = new SafeAPI.Cons({
    middleware: new SafeAPI.Fragment("/hello"),
    next: new SafeAPI.Nil()
  });
  const app = new Koa();
  app.use(
    Server.safeGet(endpoint, async () => {
      return "world";
    })
  );
  const server = app.listen();
  TestUtils.cleanupWith(() => server.close());
  return { server, endpoint };
}

describe("for a GET endpoint with no parameters", () => {
  it("should be able to generate a server", async () => {
    const { server } = makeSafeServer();
    const resp = await fetch(`http://localhost:${server.address().port}/hello`);
    const json = await resp.json();
    expect(json).toBe("world");
  });

  it("should be able to generate a compatible client", async () => {
    const { server, endpoint } = makeSafeServer();
    const absoluteEndpoint: SafeAPI.Endpoint<{}, string> = new SafeAPI.Cons({
      middleware: new SafeAPI.PrependFragmentClient(
        `http://localhost:${server.address().port}`
      ),
      next: endpoint
    });
    const resp = await Client.safeGet(absoluteEndpoint, {});
    expect(resp).toBe("world");
  });
});

// Server type tests
() => {
  const endpoint: SafeAPI.Endpoint<{}, string> = new SafeAPI.Cons({
    middleware: new SafeAPI.Fragment("/hello"),
    next: new SafeAPI.Nil()
  });
  const app = new Koa();

  // it permits correct output types in handlers
  // ok
  app.use(Server.safeGet(endpoint, async () => "world"));

  // it rejects invalid output types in handlers
  // $FlowFixMe
  app.use(Server.safeGet(endpoint, async () => 1));

  // it permits correct input types in handlers
  app.use(
    Server.safeGet(endpoint, async input => {
      // ok
      (input: {});
      return "world";
    })
  );

  // it rejects invalid input types in handlers
  app.use(
    Server.safeGet(endpoint, async input => {
      // $FlowFixMe
      (input: { foo: string });
      return "world";
    })
  );
};

// Client type tests
() => {
  const endpoint: SafeAPI.Endpoint<{}, string> = new SafeAPI.Cons({
    middleware: new SafeAPI.PrependFragmentClient("http://localhost:8080"),
    next: new SafeAPI.Cons({
      middleware: new SafeAPI.Fragment("/hello"),
      next: new SafeAPI.Nil()
    })
  });

  // it permits correct output types in handlers
  // ok
  (Client.safeGet(endpoint, {}): Promise<string>);

  // it rejects invalid output types in handlers
  // $FlowFixMe
  (Client.safeGet(endpoint, {}): Promise<number>);

  // it permits correct input types in handlers
  // ok
  Client.safeGet(endpoint, {});
};
