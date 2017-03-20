import {assert} from 'chai';
import {empty, freeze, isFrozen, thaw} from '../../src';

suite('[SortedSet]', () => {
  suite('freeze()', () => {
    test('if the input set is already immutable, it is returned unmodified', () => {
      const set = empty();
      assert.strictEqual(freeze(set), set);
    });

    test('if the input set is mutable, an immutable clone is returned', () => {
      const set = thaw(empty());
      assert.notStrictEqual(freeze(set), set);
    });
  });

  suite('isFrozen()', () => {
    test('returns true if the input set is immutable', () => {
      const set = empty();
      assert.isTrue(isFrozen(set));
    });

    test('returns false if the input set is mutable', () => {
      const set = thaw(empty());
      assert.isFalse(isFrozen(set));
    });
  });
});