import {assert} from 'chai';
import {Set, remove, has, size, fromArray, thaw, isThawed, isFrozen} from '../../src';

suite('[Set]', () => {
  suite('remove()', () => {
    let set0: Set<string>, set1: Set<string>;
    suite('when the item does not exist in the set', () => {
      setup(() => {
        set0 = fromArray(['A', 'B', 'C']);
        set1 = remove('D', set0);
      });

      test('the set size does not change', () => {
        assert.strictEqual(size(set1), 3);
      });

      test('the input set is returned unmodified', () => {
        assert.strictEqual(set0, set1);
      });

      test('the item is still unretrievable from the set', () => {
        assert.isFalse(has('D', set1));
      });
    });

    suite('when the item exists in the set', () => {
      const values0 = ['A', 'B', 'C', 'D', 'E'];
      const values1 = ['A', 'B', 'D', 'E'];
      suite('if the input set is mutable', () => {
        suiteSetup(() => {
          set0 = thaw(fromArray(values0));
          set1 = remove('C', set0);
        });

        test('the input set is returned', () => {
          assert.strictEqual(set0, set1);
        });

        test('the input set is still mutable', () => {
          assert.isTrue(isThawed(set0));
        });

        test('the input set size is decremented', () => {
          assert.strictEqual(size(set0), values1.length);
        });

        test('the removed item can no longer be retrieved from the input set', () => {
          assert.isFalse(has('C', set0));
        });

        test('the input set still contains all items other than the removed item', () => {
          assert.sameMembers(Array.from(set0), values1);
        });
      });

      suite('if the input set is mutable', () => {
        suiteSetup(() => {
          set0 = fromArray(values0);
          set1 = remove('C', set0);
        });

        test('the input set is not modified', () => {
          assert.strictEqual(size(set0), values0.length);
          assert.sameMembers(Array.from(set0), values0);
          assert.isTrue(isFrozen(set0));
        });

        test('a new immutable set is returned', () => {
          assert.notStrictEqual(set0, set1);
          assert.isTrue(isFrozen(set1));
        });

        test('the size of the new set is one less than that of the input set', () => {
          assert.strictEqual(size(set1), values1.length);
        });

        test('the removed item can no longer be retrieved from the new set', () => {
          assert.isFalse(has('C', set1));
        });

        test('the new set contains all items from the input set other than the removed item', () => {
          assert.sameMembers(Array.from(set1), values1);
        });
      });
    });
  });
});