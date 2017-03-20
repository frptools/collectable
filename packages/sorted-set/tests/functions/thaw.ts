import {assert} from 'chai';
import {empty, isThawed, thaw} from '../../src';

suite('[SortedSet]', () => {
  suite('thaw()', () => {
    test('if the input set is already mutable, it is returned unmodified', () => {
      const set = thaw(empty());
      assert.strictEqual(thaw(set), set);
    });

    test('if the input set is immutable, a mutable clone is returned', () => {
      const set = empty();
      assert.notStrictEqual(thaw(set), set);
    });
  });

  suite('isThawed()', () => {
    test('returns true if the input set is mutable', () => {
      const set = thaw(empty());
      assert.isTrue(isThawed(set));
    });

    test('returns false if the input set is immutable', () => {
      const set = empty();
      assert.isFalse(isThawed(set));
    });
  });
});