import {assert} from 'chai';
import {forEach} from '../../src';
import {SortedMap, fromNumericArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  suite('forEach()', () => {
    let map: SortedMap, values: number[];
    suiteSetup(() => {
      values = [1, 2, 3, 5, 8, 13, 21, 34, 55];
      map = fromNumericArray(values);
    });

    test('the predicate is called for each item in the map', () => {
      const array: [number, string][] = [];
      forEach((v, k) => array.push([k, v]), map);
      assert.deepEqual(array, pairsFrom(values));
    });

    test('iteration is terminated if `false` is explicitly returned from the predicate', () => {
      let count = 0;
      forEach((v, k, i) => {
        count++;
        if(i === 3) return false;
      }, map);
      assert.strictEqual(count, 4);
    });

    test('the input map is returned after iteration is complete', () => {
      const map1 = forEach(n => {}, map);
      assert.strictEqual(map, map1);
    });
  });
});