import {assert} from 'chai';
import {empty, freeze, isFrozen, thaw} from '../../src';

suite('[SortedMap]', () => {
  suite('freeze()', () => {
    test('if the input map is already immutable, it is returned unmodified', () => {
      const set = empty();
      assert.strictEqual(freeze(set), set);
    });

    test('if the input map is mutable, an immutable clone is returned', () => {
      const set = thaw(empty());
      assert.notStrictEqual(freeze(set), set);
    });
  });

  suite('isFrozen()', () => {
    test('returns true if the input map is immutable', () => {
      const set = empty();
      assert.isTrue(isFrozen(set));
    });

    test('returns false if the input map is mutable', () => {
      const set = thaw(empty());
      assert.isFalse(isFrozen(set));
    });
  });
});