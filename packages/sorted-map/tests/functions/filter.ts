import {assert} from 'chai';
import {isMutable, isImmutable, modify} from '@collectable/core';
import {filter, size, has} from '../../src';
import {SortedMap, fromNumericArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  suite('filter()', () => {
    let values0: number[],
        values1: number[],
        values2: number[];
    const predicate1 = (_: any, n: number) => ((n >>> 1) << 1) !== n;
    const predicate2 = (_: any, n: number) => ((n >>> 1) << 1) === n;
    suiteSetup(() => {
      values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55];
      values1 = [1, 3, 5, 13, 21, 55];
      values2 = [2, 8, 34];
    });

    test('items are considered excluded if the predicate returns a falsey value', () => {
      const map0 = fromNumericArray(values0);
      const map1 = filter(predicate1, map0);
      assert.deepEqual(Array.from(map1), pairsFrom(values1));
    });

    test('items are considered included if the predicate returns a truthy value', () => {
      const map0 = fromNumericArray(values0);
      const map1 = filter(predicate2, map0);
      assert.deepEqual(Array.from(map1), pairsFrom(values2));
    });

    suite('if the input map is mutable', () => {
      let map0: SortedMap, map1: SortedMap;
      suiteSetup(() => {
        map0 = modify(fromNumericArray(values0));
        map1 = filter(predicate1, map0);
      });

      test('the input map is returned', () => {
        assert.strictEqual(map0, map1);
      });

      test('the input map is still mutable', () => {
        assert.isTrue(isMutable(map0));
      });

      test('the map size is decreased by the number of items excluded by the filter', () => {
        assert.strictEqual(size(map0), values1.length);
      });

      test('the excluded items can no longer be retrieved from the map', () => {
        for(let k of values2) {
          assert.isFalse(has(k, map0));
        }
      });

      test('items not excluded by the filter can still be retrieved from the map', () => {
        for(let k of values1) {
          assert.isTrue(has(k, map0));
        }
      });
    });

    suite('if the input map is immutable', () => {
      let map0: SortedMap, map1: SortedMap;
      suiteSetup(() => {
        map0 = fromNumericArray(values0);
        map1 = filter(predicate1, map0);
      });

      test('the input map is not modified', () => {
        assert.notStrictEqual(map0, map1);
        assert.strictEqual(size(map0), values0.length);
        assert.deepEqual(Array.from(map0), pairsFrom(values0));
        assert.isTrue(isImmutable(map0));
      });

      test('a new immutable map is returned', () => {
        assert.isTrue(isImmutable(map1));
      });

      test('the size of the new map equals that of the input map, minus the number of items excluded by the filter', () => {
        assert.strictEqual(size(map1), values1.length);
      });

      test('the new map contains only the items from the input map that were not excluded by the filter', () => {
        assert.deepEqual(Array.from(map1), pairsFrom(values1));
      });
    });
  });
});