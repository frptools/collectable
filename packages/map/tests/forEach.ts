import {assert} from 'chai';
import {Map, fromArray, forEach} from '../src';

type Pair = [number, string];

suite('[Map]', () => {
  suite('forEach()', () => {
    let map: Map<number, string>, values: Pair[];
    suiteSetup(() => {
      values = [1, 2, 3, 5, 8, 13, 21, 34, 55].map(n => <Pair>[n, `#${n}`]);
      map = fromArray(values);
    });

    test('the predicate is called for each item in the map', () => {
      const array: Pair[] = [];
      forEach((v, k) => array.push([k, v]), map);
      assert.sameDeepMembers(array, values);
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
      const set1 = forEach(n => {}, map);
      assert.strictEqual(map, set1);
    });
  });
});