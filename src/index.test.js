// @flow
import * as SafeAPI from "./";
// extensible fluent syntax
it.only("works", () => {
  const endpoint = SafeAPI.basic()
    .use({ fragment: SafeAPI.Fragment })
    .use({ queryParams: SafeAPI.QueryParams })
});
