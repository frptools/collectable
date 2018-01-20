import test from 'ava';
import { isMutable, modify } from '@collectable/core';
import { map as _map, size } from '../../src';
import { SortedMap, fromStringArray } from '../test-utils';

const toLower = (v: number, k: string) => k.toLowerCase();
const values = ['A', 'B', 'C', 'D', 'E'];
let map: SortedMap;

test.beforeEach(() => {
  map = modify(fromStringArray(values));
});

test('the input map is returned', t => {
  t.is(_map(toLower, map), map);
});

test('the input map is still mutable', t => {
  _map(toLower, map);
  t.true(isMutable(map));
});

test('the map size remains unchanged', t => {
  t.is(size(_map(toLower, map)), values.length);
});

test('the predicate is called for each member of the input map', t => {
  let each: string[] = [];
  _map((v, k) => (each.push(k), v), map);
  t.deepEqual(each, values);
});

test('all members of the map are replaced by their transformed counterpart returned by the predicate', t => {
  t.deepEqual<any>(Array.from(_map(toLower, map)), values.map(v => [v, v.toLowerCase()]));
});
