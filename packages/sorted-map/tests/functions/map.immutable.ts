import test from 'ava';
import { isImmutable } from '@collectable/core';
import { map as _map, size } from '../../src';
import { SortedMap, fromStringArray, pairsFrom } from '../test-utils';

const toLower = (v: number, k: string) => k.toLowerCase();
const values = ['A', 'B', 'C', 'D', 'E'];
let map0: SortedMap, map1: SortedMap;

test.beforeEach(() => {
  map0 = fromStringArray(values);
  map1 = _map(toLower, map0);
});

test('the input map is not modified', t => {
  t.is(size(map0), values.length);
  t.true(isImmutable(map0));
  t.deepEqual(Array.from(map0), pairsFrom(values));
});

test('a new immutable map is returned', t => {
  t.true(isImmutable(map1));
  t.not(map0, map1);
});

test('the size of the new map equals that of the input map', t => {
  t.is(size(map0), size(map1));
});

test('the predicate is called for each member of the input map', t => {
  let each: string[] = [];
  _map((v, k) => (each.push(k), v), map0);
  t.deepEqual(each, values);
});

test('the new map is populated by the predicate-transformed counterparts of each member of the input map', t => {
  t.deepEqual<any>(Array.from(_map(toLower, map1)), values.map(v => [v, v.toLowerCase()]));
});
