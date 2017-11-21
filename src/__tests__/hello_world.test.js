// @flow
import * as SafeAPI from "../";
import * as Client from "../client";
import * as Server from "../server";
import Koa from "koa";
import fetch from "isomorphic-fetch";

function withSafeServer(
  continuation: any => Promise<void>
): () => Promise<void> {
  return async () => {
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
    await continuation({ server, endpoint });
    server.close();
  };
}

it(
  "should be able to generate a server for a GET endpoint",
  withSafeServer(async ({ server }) => {
    const resp = await fetch(`http://localhost:${server.address().port}/hello`);
    const json = await resp.json();
    expect(json).toBe("world");
  })
);

it(
  "should be able to generate a compatible client for a GET endpoint",
  withSafeServer(async ({ endpoint, server }) => {
    const absoluteEndpoint: SafeAPI.Endpoint<{}, string> = new SafeAPI.Cons({
      middleware: new SafeAPI.PrependFragmentClient(
        `http://localhost:${server.address().port}`
      ),
      next: endpoint
    });
    const resp = await Client.safeGet(absoluteEndpoint, {});
    expect(resp).toBe("world");
  })
);

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
  // ok
  app.use(
    Server.safeGet(endpoint, async input => {
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
async () => {
  const endpoint: SafeAPI.Endpoint<{}, string> = new SafeAPI.Cons({
    middleware: new SafeAPI.Fragment("/hello"),
    next: new SafeAPI.Nil()
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
