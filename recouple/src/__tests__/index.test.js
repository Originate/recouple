// @flow
const Recouple = require("../");
const T = require("../type_rep");
const { endpoint } = require("../");

describe("endpoint", () => {
  describe("when called by itself", () => {
    it("returns an empty endpoint", () => {
      expect(endpoint()).toEqual(new Recouple.Nil());
    });

    // type-level tests
    () => {
      // ok
      (endpoint(): Recouple.Endpoint<{}, string>);

      // $FlowFixMe
      (endpoint(): Recouple.Endpoint<{ foo: string }, string>);
    };
  });

  describe("when chained with a single fragment", () => {
    it("returns an endpoint with the fragment", () => {
      expect(endpoint().fragment("foo")).toEqual(
        new Recouple.Snoc({
          previous: new Recouple.Nil(),
          middleware: new Recouple.Fragment("foo")
        })
      );
    });

    // type-level tests
    () => {
      // ok
      (endpoint().fragment("foo"): Recouple.Endpoint<{}, string>);

      // $FlowFixMe
      (endpoint().fragment("foo"): Recouple.Endpoint<{ foo: string }, string>);
    };
  });
});

// type-level tests
() => {
  // ok
  (endpoint().queryParams({
    id: T.option(T.string)
  }): Recouple.Endpoint<{ id: ?string }, string>);

  // $FlowFixMe
  (endpoint().queryParams({
    id: T.option(T.string)
  }): Recouple.Endpoint<{ id: string }, string>);
};
