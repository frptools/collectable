import {assert} from 'chai';
import {commit, isImmutable, modify} from '@collectable/core';
import {empty} from '../../src';

suite('[SortedMap]', () => {
  suite('commit()', () => {
    test('if the input map is already immutable, it is returned unmodified', () => {
      const set = empty();
      assert.strictEqual(commit(set), set);
    });

    test('if the input map is mutable, it is frozen and then returned', () => {
      const set = modify(empty());
      assert.strictEqual(commit(set), set);
      assert.isTrue(isImmutable(set));
    });
  });

  suite('isImmutable()', () => {
    test('returns true if the input map is immutable', () => {
      const set = empty();
      assert.isTrue(isImmutable(set));
    });

    test('returns false if the input map is mutable', () => {
      const set = modify(empty());
      assert.isFalse(isImmutable(set));
    });
  });
});