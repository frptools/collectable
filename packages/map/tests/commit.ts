import test from 'ava';
import { commit, modify, unwrap } from '@collectable/core';
import { empty, set } from '../src';

test('returns the same map if already mutable', t => {
  var map = modify(set('x', 3, empty()));
  commit(map);
  var map1 = commit(map);

  t.is(map, map1);
  t.deepEqual(unwrap(map), { x: 3 });
});

test('operations performed on an immutable map return a new map', t => {
  var map = set('x', 3, empty(true));
  set('y', 1, map);
  set('z', 2, map);
  commit(map);
  var map1 = set('z', 3, map);

  t.not(map, map1);
  t.deepEqual(unwrap(map), { x: 3, y: 1, z: 2 });
  t.deepEqual(unwrap(map1), { x: 3, y: 1, z: 3 });
});