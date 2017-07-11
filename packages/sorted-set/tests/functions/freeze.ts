import {assert} from 'chai';
import {modify, isImmutable, commit} from '@collectable/core';
import {empty} from '../../src';

suite('[SortedSet]', () => {
  suite('commit()', () => {
    test('if the input set is already immutable, it is returned unmodified', () => {
      const set = empty();
      assert.strictEqual(commit(set), set);
    });

    test('if the input set is mutable, it is frozen and then returned', () => {
      const set = modify(empty());
      assert.strictEqual(commit(set), set);
      assert.isTrue(isImmutable(set));
    });
  });

  suite('isImmutable()', () => {
    test('returns true if the input set is immutable', () => {
      const set = empty();
      assert.isTrue(isImmutable(set));
    });

    test('returns false if the input set is mutable', () => {
      const set = modify(empty());
      assert.isFalse(isImmutable(set));
    });
  });
});