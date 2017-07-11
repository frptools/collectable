import {assert} from 'chai';
import {HashMapStructure, fromArray, forEach} from '../src';

type Pair = [number, string];

suite('[HashMap]', () => {
  suite('forEach()', () => {
    let map: HashMapStructure<number, string>, values: Pair[];
    setup(() => {
      values = [1, 2, 3, 5, 8, 13, 21, 34, 55].map(n => <Pair>[n, `#${n}`]);
      // console.log(values);
      map = fromArray(values);
      // console.log(Array.from(map));
    });

    test('the predicate is called for each item in the map', () => {
      // console.log('(a)', values);
      const array: Pair[] = [];
      forEach((v, k) => array.push([k, v]), map);
      array.sort((a, b) => a[0] - b[0]);
      // console.log('(b)', array);
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