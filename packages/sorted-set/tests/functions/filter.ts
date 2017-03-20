import {assert} from 'chai';
import {SortedSet, filter, size, has, thaw, isThawed, isFrozen} from '../../src';
import {fromNumericArray} from '../test-utils';

suite('[SortedSet]', () => {
  suite('filter()', () => {
    let values0: number[],
        values1: number[],
        values2: number[];
    const predicate1 = (n: number) => ((n >>> 1) << 1) !== n;
    const predicate2 = (n: number) => ((n >>> 1) << 1) === n;
    suiteSetup(() => {
      values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55];
      values1 = [1, 3, 5, 13, 21, 55];
      values2 = [2, 8, 34];
    });

    test('items are considered excluded if the predicate returns a falsey value', () => {
      const set0 = fromNumericArray(values0);
      const set1 = filter(predicate1, set0);
      assert.deepEqual(Array.from(set1), values1);
    });

    test('items are considered included if the predicate returns a truthy value', () => {
      const set0 = fromNumericArray(values0);
      const set1 = filter(predicate2, set0);
      assert.deepEqual(Array.from(set1), values2);
    });

    suite('if the input set is mutable', () => {
      let set0: SortedSet<number>, set1: SortedSet<number>;
      suiteSetup(() => {
        set0 = thaw(fromNumericArray(values0));
        set1 = filter(predicate1, set0);
      });

      test('the input set is returned', () => {
        assert.strictEqual(set0, set1);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isThawed(set0));
      });

      test('the set size is decreased by the number of items excluded by the filter', () => {
        assert.strictEqual(size(set0), values1.length);
      });

      test('the excluded items can no longer be retrieved from the set', () => {
        for(let k of values2) {
          assert.isFalse(has(k, set0));
        }
      });

      test('items not excluded by the filter can still be retrieved from the set', () => {
        for(let k of values1) {
          assert.isTrue(has(k, set0));
        }
      });
    });

    suite('if the input set is immutable', () => {
      let set0: SortedSet<number>, set1: SortedSet<number>;
      suiteSetup(() => {
        set0 = fromNumericArray(values0);
        set1 = filter(predicate1, set0);
      });

      test('the input set is not modified', () => {
        assert.notStrictEqual(set0, set1);
        assert.strictEqual(size(set0), values0.length);
        assert.deepEqual(Array.from(set0), values0);
        assert.isTrue(isFrozen(set0));
      });

      test('a new immutable set is returned', () => {
        assert.isTrue(isFrozen(set1));
      });

      test('the size of the new set equals that of the input set, minus the number of items excluded by the filter', () => {
        assert.strictEqual(size(set1), values1.length);
      });

      test('the new set contains only the items from the input set that were not excluded by the filter', () => {
        assert.deepEqual(Array.from(set1), values1);
      });
    });
  });
});