// @flow
import * as SafeAPI from "./";
import * as t from "./type_rep";
// extensible fluent syntax
it.only("works", () => {
  const endpoint = SafeAPI.safeAPI()
    .use({ queryParams: SafeAPI.queryParams })
    .use({ fragment: SafeAPI.fragment });

  // The following should error
  // $FlowFixMe
  const myEndpoint: SafeAPI.Endpoint<*, {}, string> = endpoint()
    .fragment("hello")
    .queryParams({ foo: t.string })
    .queryParams({ bar: t.string });

  console.log(JSON.stringify(myEndpoint, null, 2));
});
