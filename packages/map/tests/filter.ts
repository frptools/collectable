import {assert} from 'chai';
import {fromArray, filter} from '../src';

type Pair = [number, string];
function pairFromNumber(n: number): [number, string] {
  return [n, `#${n}`];
}

suite('[Map]', () => {
  suite('filter()', () => {
    let values0: Pair[], values1: Pair[], values2: Pair[];
    const predicate1 = (value: string, key: number) => ((key >>> 1) << 1) !== key;
    const predicate2 = (value: string, key: number) => ((key >>> 1) << 1) === key;
    suiteSetup(() => {
      values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map(pairFromNumber);
      values1 = values0.filter(v => predicate1(v[1], v[0]));
      values2 = values0.filter(v => predicate2(v[1], v[0]));
    });

    test('items are considered excluded if the predicate returns a falsey value', () => {
      const map0 = fromArray(values0);
      const map1 = filter(predicate1, map0);
      assert.sameDeepMembers(Array.from(map1), values1);
    });

    test('items are considered included if the predicate returns a truthy value', () => {
      const map0 = fromArray(values0);
      const map1 = filter(predicate2, map0);
      assert.sameDeepMembers(Array.from(map1), values2);
    });
  });
});