import test from 'ava';
import { filter, fromArray } from '../src';

type Pair = [number, string];
function pairFromNumber (n: number): [number, string] {
  return [n, `#${n}`];
}

let values0: Pair[], values1: Pair[], values2: Pair[];
const predicate1 = (value: string, key: number) => ((key >>> 1) << 1) !== key;
const predicate2 = (value: string, key: number) => ((key >>> 1) << 1) === key;
test.before(() => {
  values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89].map(pairFromNumber);
  values1 = values0.filter(v => predicate1(v[1], v[0]));
  values2 = values0.filter(v => predicate2(v[1], v[0]));
});

test('items are considered excluded if the predicate returns a falsey value', t => {
  const map0 = fromArray(values0);
  const map1 = filter(predicate1, map0);
  t.deepEqual(Array.from(map1).sort((a, b) => a[0] - b[0]), values1);
});

test('items are considered included if the predicate returns a truthy value', t => {
  const map0 = fromArray(values0);
  const map1 = filter(predicate2, map0);
  t.deepEqual(Array.from(map1).sort((a, b) => a[0] - b[0]), values2);
});
