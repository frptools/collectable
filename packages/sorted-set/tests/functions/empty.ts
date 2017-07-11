import {assert} from 'chai';
import {emptyWithNumericKeys} from '@collectable/red-black-tree';
import {empty, size, isSortedSet} from '../../src';

suite('[SortedSet]', () => {
  suite('empty()', () => {
    test('returns a set with size 0', () => {
      assert.strictEqual(size(empty()), 0);
    });

    test('always returns the same set instance if called with no arguments', () => {
      const a = empty(), b = empty();
      assert.strictEqual(a, b);
    });
  });

  suite('isSet()', () => {
    test('returns true if the argument is an instance of a Collectable.js SortedSet class', () => {
      assert.isTrue(isSortedSet(empty()));
    });

    test('returns false if the argument is not an instance of a Collectable.js SortedSet class', () => {
      assert.isFalse(isSortedSet(emptyWithNumericKeys()));
    });
  });
});