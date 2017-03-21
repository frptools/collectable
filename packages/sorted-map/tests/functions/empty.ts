import {assert} from 'chai';
import {empty as emptyMap} from '@collectable/red-black-tree';
import {empty, size, isSortedMap} from '../../src';

suite('[SortedMap]', () => {
  suite('empty()', () => {
    test('returns a map with size 0', () => {
      assert.strictEqual(size(empty()), 0);
    });

    test('always returns the same set instance if called with no arguments', () => {
      const a = empty(), b = empty();
      assert.strictEqual(a, b);
    });
  });

  suite('isSet()', () => {
    test('returns true if the argument is an instance of a Collectable.js SortedMap class', () => {
      assert.isTrue(isSortedMap(empty()));
    });

    test('returns false if the argument is not an instance of a Collectable.js SortedMap class', () => {
      assert.isFalse(isSortedMap(emptyMap()));
    });
  });
});