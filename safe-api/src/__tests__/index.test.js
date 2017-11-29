// @flow
const SafeAPI = require("../");
const { endpoint } = require("../");

describe("endpoint", () => {
  describe("when called by itself", () => {
    it("returns an empty endpoint", () => {
      expect(endpoint()).toEqual(new SafeAPI.Nil());
    });

    // type-level tests
    () => {
      // ok
      (endpoint(): SafeAPI.Endpoint<{}, string>);

      // $FlowFixMe
      (endpoint(): SafeAPI.Endpoint<{ foo: string }, string>);
    };
  });

  describe("when chained with a single fragment", () => {
    it("returns an endpoint with the fragment", () => {
      expect(endpoint().fragment("foo")).toEqual(
        new SafeAPI.Snoc({
          previous: new SafeAPI.Nil(),
          middleware: new SafeAPI.Fragment("foo")
        })
      );
    });

    // type-level tests
    () => {
      // ok
      (endpoint().fragment("foo"): SafeAPI.Endpoint<{}, string>);

      // $FlowFixMe
      (endpoint().fragment("foo"): SafeAPI.Endpoint<{ foo: string }, string>);
    };
  });
});
