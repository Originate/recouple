// @flow

const _cleanupFns: Array<() => any> = [];
afterEach(() => {
  while (_cleanupFns.length > 0) {
    const fn = _cleanupFns.pop();
    fn();
  }
});

export function cleanupWith(fn: () => any) {
  _cleanupFns.push(fn);
}
