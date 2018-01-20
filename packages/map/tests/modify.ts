import test from 'ava';
import { isMutable, modify, unwrap } from '@collectable/core';
import { empty, set } from '../src';

test('creates a mutable copy of the original map', t => {
  var map = set('x', 3, empty());

  t.false(isMutable(map));

  var map1 = modify(map);

  t.not(map, map1);
  t.false(isMutable(map));
  t.true(isMutable(map1));
  t.deepEqual(unwrap(map), { x: 3 });
  t.deepEqual(unwrap(map1), { x: 3 });
});

test('returns the same map if already mutable', t => {
  var map = set('x', 3, empty());
  var map1 = modify(map);
  var map2 = modify(map1);

  t.not(map, map1);
  t.is(map1, map2);
  t.deepEqual(unwrap(map), { x: 3 });
  t.deepEqual(unwrap(map1), { x: 3 });
});

test('operations performed on a mutable map update and return the original map', t => {
  var map = modify(set('x', 3, empty()));
  var map1 = set('y', 1, map);
  var map2 = set('z', 2, map1);

  t.is(map, map1);
  t.is(map, map2);
  t.deepEqual(unwrap(map), { x: 3, y: 1, z: 2 });
});
