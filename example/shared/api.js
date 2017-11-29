// @flow

import * as SafeAPI from "safe-api";

export const hello: SafeAPI.Endpoint<{}, string> = SafeAPI.endpoint().fragment(
  "hello"
);
