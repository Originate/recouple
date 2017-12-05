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

  describe("when chained with a capture param with a singleton object", () => {
    it("returns an endpoint with the capture param", () => {
      expect(endpoint().captureParam({ id: T.string })).toEqual(
        new Recouple.Snoc({
          previous: new Recouple.Nil(),
          middleware: new Recouple.CaptureParam({ id: T.string })
        })
      );
    });

    // type-level tests
    () => {
      // ok
      (endpoint().captureParam({ id: T.string }): Recouple.Endpoint<
        { id: string },
        string
      >);

      // $FlowFixMe
      (endpoint().captureParam({ id: T.string }): Recouple.Endpoint<
        { id: number },
        string
      >);
    };
  });

  describe("when chained with a capture param with an empty object", () => {
    it("throws an exception", () => {
      expect(() => endpoint().captureParam({})).toThrow();
    });
  });

  describe("when chained with a capture param with an object with multiple keys", () => {
    it("throws an exception", () => {
      expect(() =>
        endpoint().captureParam({ id: T.string, name: T.string })
      ).toThrow();
    });
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
