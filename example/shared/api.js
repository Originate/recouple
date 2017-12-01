// @flow

import { type Endpoint, endpoint } from "recouple";

export const hello: Endpoint<{}, string> = endpoint().fragment("hello");
