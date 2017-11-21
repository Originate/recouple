// @flow
import * as Utils from "./utils";

describe("stringExpansion", () => {
  const lcase = Utils.stringExpansion(s => s.toLowerCase());

  describe("called as a string function", () => {
    it("returns the transformed string", () => {
      expect(lcase("FOO")).toEqual("foo");
    });
  });

  describe("called as a string expansion function", () => {
    it("returns the transformed string if there are no interpolated values", () => {
      expect(lcase`FOO`).toEqual("foo");
    });

    it("returns the interpolated transformed string if there are interpolated values", () => {
      const x = 1;
      const y = "HELLO";
      expect(lcase`FOO${x}BAR${y}`).toEqual("foo1barhello");
    });
  });
});
