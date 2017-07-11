import {assert} from 'chai';
import {isMutable, modify} from '@collectable/core';
import {empty} from '../../src';

suite('[SortedMap]', () => {
  suite('modify()', () => {
    test('if the input map is already mutable, it is returned unmodified', () => {
      const set = modify(empty());
      assert.strictEqual(modify(set), set);
    });

    test('if the input map is immutable, a mutable clone is returned', () => {
      const set = empty();
      assert.notStrictEqual(modify(set), set);
    });
  });

  suite('isMutable()', () => {
    test('returns true if the input map is mutable', () => {
      const set = modify(empty());
      assert.isTrue(isMutable(set));
    });

    test('returns false if the input map is immutable', () => {
      const set = empty();
      assert.isFalse(isMutable(set));
    });
  });
});