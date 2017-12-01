// @flow

import * as Recouple from "recouple";

export const hello: Recouple.Endpoint<
  {},
  string
> = Recouple.endpoint().fragment("hello");
