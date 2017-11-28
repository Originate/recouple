// @flow

import * as SafeAPI from "../../";

export const hello: SafeAPI.Endpoint<{}, string> = SafeAPI.endpoint().fragment(
  "hello"
);
