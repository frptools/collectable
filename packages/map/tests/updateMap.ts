import test from 'ava';
import { isMutable, unwrap } from '@collectable/core';
import { empty, set, updateMap } from '../src';

test('returns the same map if no changes are made', t => {
  var map = empty();
  var map1 = updateMap(m => {}, map);
  var map2 = updateMap(m => m, map);
  t.is(map, map1);
  t.is(map, map2);
});

test('creates a mutable copy of the original map, then freezes and returns it', t => {
  var map = set('x', 3, empty());

  var map1a: any = void 0;
  var map1 = updateMap(m => {
    set('y', 5, m);
    set('z', 7, m);
    t.true(isMutable(m));
    map1a = m;
  }, map);

  var map2a: any = void 0;
  var map2 = updateMap(m => {
    var m1 = set('x', 9, m);
    var m2 = m = set('k', 1, m);
    t.is(m, m1);
    t.is(m, m2);
    map2a = m2;
    t.true(isMutable(m));
    return m2;
  }, map1);

  t.is(map1, map1a);
  t.is(map2, map2a);
  t.false(isMutable(map));
  t.false(isMutable(map1));
  t.false(isMutable(map2));
  t.deepEqual(unwrap(map), { x: 3 });
  t.deepEqual(unwrap(map1), { x: 3, y: 5, z: 7 });
  t.deepEqual(unwrap(map2), { x: 9, y: 5, z: 7, k: 1 });
});
