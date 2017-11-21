// @flow
import * as SafeAPI from "./";
import { endpoint } from "./";

describe("endpoint", () => {
  describe("when called with no arguments", () => {
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

  describe("when called with a single string", () => {
    it("returns an endpoint with a single URL fragment", () => {
      expect(endpoint("foo")).toEqual(
        new SafeAPI.Snoc({
          previous: new SafeAPI.Nil(),
          middleware: new SafeAPI.Fragment("foo")
        })
      );
    });

    // type-level tests
    () => {
      // ok
      (endpoint("foo"): SafeAPI.Endpoint<{}, string>);

      // $FlowFixMe
      (endpoint("foo"): SafeAPI.Endpoint<{ foo: string }, string>);
    };
  });

  describe("when called as a string expansion", () => {
    it("returns an endpoint with a single URL fragment", () => {
      expect(endpoint`foo`).toEqual(
        new SafeAPI.Snoc({
          previous: new SafeAPI.Nil(),
          middleware: new SafeAPI.Fragment("foo")
        })
      );
    });

    it("returns an endpoint with a single URL fragment, with interpolations applied", () => {
      const bar = "bar";
      expect(endpoint`foo${bar}`).toEqual(
        new SafeAPI.Snoc({
          previous: new SafeAPI.Nil(),
          middleware: new SafeAPI.Fragment("foobar")
        })
      );
    });

    // type-level tests
    () => {
      // ok
      (endpoint`foo`: SafeAPI.Endpoint<{}, string>);

      // $FlowFixMe
      (endpoint`foo`: SafeAPI.Endpoint<{ foo: string }, string>);
    };
  });

  describe("when chaining a fragment on top of a base fragment", () => {
    it("returns an endpoint with both URL fragments", () => {
      expect(endpoint`foo`.fragment`bar`).toEqual(
        new SafeAPI.Snoc({
          previous: new SafeAPI.Snoc({
            previous: new SafeAPI.Nil(),
            middleware: new SafeAPI.Fragment("foo")
          }),
          middleware: new SafeAPI.Fragment("bar")
        })
      );
    });

    // type-level tests
    () => {
      // ok
      (endpoint`foo`.fragment`bar`: SafeAPI.Endpoint<{}, string>);

      // $FlowFixMe
      (endpoint`foo`.fragment`bar`: SafeAPI.Endpoint<{ foo: string }, string>);
    };
  });
});
