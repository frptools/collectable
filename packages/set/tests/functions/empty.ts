import {assert} from 'chai';
import {empty as emptyMap} from '@collectable/map';
import {empty, size, isSet} from '../../src';

suite('[HashSet]', () => {
  suite('empty()', () => {
    test('returns a set with size 0', () => {
      assert.strictEqual(size(empty()), 0);
    });

    test('always returns the same set instance', () => {
      const a = empty(), b = empty();
      assert.strictEqual(a, b);
    });
  });

  suite('isSet()', () => {
    test('returns true if the argument is an instance of a Collectable.js Set class', () => {
      assert.isTrue(isSet(empty()));
    });

    test('returns false if the argument is not an instance of a Collectable.js Set class', () => {
      assert.isFalse(isSet(emptyMap()));
    });
  });
});