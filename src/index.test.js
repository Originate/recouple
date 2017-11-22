// @flow
import * as SafeAPI from "./";
import * as t from "./type_rep";

// extensible fluent syntax
it("works", () => {
  const endpoint = SafeAPI.safeAPI()
    .use({ queryParams: SafeAPI.queryParams })
    .use({ fragment: SafeAPI.fragment });

  const myEndpoint: SafeAPI.Endpoint<*, { foo: string }, string> = endpoint()
    .fragment("hello")
    .queryParams({ foo: t.string });

  console.log(JSON.stringify(myEndpoint, null, 2));
});

// type level tests

// happy path: one input transforming middleware
() => {
  const endpoint = SafeAPI.safeAPI()
    .use({ queryParams: SafeAPI.queryParams })
    .use({ fragment: SafeAPI.fragment });

  // ok
  const myEndpoint: SafeAPI.Endpoint<*, { foo: string }, string> = endpoint()
    .fragment("hello")
    .queryParams({ foo: t.string })
};

// happy path: two input transforming middlewares
() => {
  const endpoint = SafeAPI.safeAPI()
    .use({ queryParams: SafeAPI.queryParams })
    .use({ fragment: SafeAPI.fragment });

  // ok
  const myEndpoint: SafeAPI.Endpoint<*, { foo: string, bar: string }, string> = endpoint()
    .fragment("hello")
    .queryParams({ foo: t.string })
    .queryParams({ bar: t.string });
};

// error when using a nonexistent middleware
() => {
  const endpoint = SafeAPI.safeAPI();

  const myEndpoint: SafeAPI.Endpoint<*, {}, string> = endpoint()
    // $FlowFixMe
    .fragment("hello");
};

// error with invalid input type annotation
() => {
  const endpoint = SafeAPI.safeAPI()
    .use({ queryParams: SafeAPI.queryParams })
    .use({ fragment: SafeAPI.fragment });

  // $FlowFixMe
  const myEndpoint: SafeAPI.Endpoint<*, {}, string> = endpoint()
    .fragment("hello")
    .queryParams({ foo: t.string });
};

// error with invalid input type annotation
() => {
  const endpoint = SafeAPI.safeAPI()
    .use({ queryParams: SafeAPI.queryParams })
    .use({ fragment: SafeAPI.fragment });

  const myEndpoint: SafeAPI.Endpoint<
    *,
    // $FlowFixMe
    { foo: string },
    string
  > = endpoint().fragment("hello");
};
