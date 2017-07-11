import {assert} from 'chai';
import {HashSetStructure, fromArray, forEach} from '../../src';

suite('[HashSet]', () => {
  suite('forEach()', () => {
    let set: HashSetStructure<number>, values: number[];
    suiteSetup(() => {
      values = [1, 2, 3, 5, 8, 13, 21, 34, 55];
      set = fromArray(values);
    });

    test('the predicate is called for each item in the set', () => {
      const array: number[] = [];
      forEach(n => array.push(n), set);
      assert.sameMembers(array, values);
    });

    test('iteration is terminated if `false` is explicitly returned from the predicate', () => {
      let count = 0;
      forEach((n, i) => {
        count++;
        if(i === 3) return false;
      }, set);
      assert.strictEqual(count, 4);
    });

    test('the input set is returned after iteration is complete', () => {
      const set1 = forEach(n => {}, set);
      assert.strictEqual(set, set1);
    });
  });
});