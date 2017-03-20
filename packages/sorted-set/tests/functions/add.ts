import {assert} from 'chai';
import {SortedSet, add, has, size, thaw, isThawed, isFrozen} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  suite('add()', () => {
    suite('when the item already exists in the set', () => {
      let set0: SortedSet<string>, set1: SortedSet<string>;
      setup(() => {
        set0 = fromStringArray(['D', 'A', 'B']);
        set1 = add('B', set0);
      });

      test('the set size does not change', () => {
        assert.strictEqual(size(set0), 3);
        assert.strictEqual(size(set1), 3);
      });

      test('the input set is returned', () => {
        assert.strictEqual(set0, set1);
      });

      test('the specified item can still be retrieved from the set', () => {
        assert.isTrue(has('B', set1));
      });
    });

    suite('when the item does not exist in the set', () => {
      let set0: SortedSet<string>, set1: SortedSet<string>;
      suite('if the input set is mutable', () => {
        suiteSetup(() => {
          set0 = thaw(fromStringArray(['A', 'B', 'D']));
          set1 = add('C', set0);
        });

        test('the input set is returned', () => {
          assert.strictEqual(set0, set1);
        });

        test('the input set is still mutable', () => {
          assert.isTrue(isThawed(set1));
        });

        test('the set size is incremented', () => {
          assert.strictEqual(size(set1), 4);
        });

        test('the added item can be retrieved from the set', () => {
          assert.isTrue(has('C', set1));
        });

        test('all expected members exist in the set in the correct order', () => {
          assert.deepEqual(Array.from(set1), ['A', 'B', 'C', 'D']);
        });
      });

      suite('if the input set is immutable', () => {
        suiteSetup(() => {
          set0 = fromStringArray(['A', 'B', 'D']);
          set1 = add('C', set0);
        });

        test('the input set is not modified', () => {
          assert.deepEqual(Array.from(set0), ['A', 'B', 'D']);
          assert.strictEqual(size(set0), 3);
          assert.isTrue(isFrozen(set0));
        });

        test('a new immutable set is returned', () => {
          assert.isTrue(isFrozen(set1));
        });

        test('the size of the new set is one greater than that of the input set', () => {
          assert.strictEqual(size(set1), 4);
        });

        test('the new set has all of the items in the input set', () => {
          for(let c of Array.from(set0)) {
            assert.isTrue(has(c, set1));
          }
        });

        test('the added item can be retrieved from the new set', () => {
          assert.isTrue(has('C', set1));
        });

        test('all expected members exist in the new set in the correct order', () => {
          assert.deepEqual(Array.from(set1), ['A', 'B', 'C', 'D']);
        });
      });
    });
  });
});