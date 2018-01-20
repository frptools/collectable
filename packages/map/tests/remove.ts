import test from 'ava';
import { isMutable, unwrap } from '@collectable/core';
import { empty, has, remove, set, updateMap } from '../src';

test('returns a new map if the original map is immutable', t => {
  var map = set('x', 3, empty<string, number>());
  var map1 = remove('x', map);

  t.not(map, map1);
});

test('returns the same map if the original map is mutable', t => {
  var map = set('x', 3, empty<string, number>(true));
  var map1 = remove('x', map);

  t.is(map, map1);
});

test('removes the specified value from a new map each time it is called on an immutable map', t => {
  var map = updateMap(m => {
    set('x', 1, m);
    set('y', 3, m);
    set('z', 5, m);
  }, empty<string, number>());

  var map1 = remove('x', map);
  var map2 = remove('y', map1);
  var map3 = remove('z', map1);

  t.not(map, map1);
  t.not(map, map2);
  t.not(map, map3);
  t.not(map1, map2);
  t.not(map1, map3);
  t.not(map2, map3);

  t.false(isMutable(map));
  t.false(isMutable(map1));
  t.false(isMutable(map2));
  t.false(isMutable(map3));

  t.deepEqual(unwrap(map), { x: 1, y: 3, z: 5 });
  t.deepEqual(unwrap(map1), { y: 3, z: 5 });
  t.deepEqual(unwrap(map2), { z: 5 });
  t.deepEqual(unwrap(map3), { y: 3 });
});

test('removes the specified value from the same map each time it is called on a mutable map', t => {
  var map = updateMap(m => {
    set('x', 1, m);
    set('y', 3, m);
    set('z', 5, m);
  }, empty<string, number>(true));

  var map1 = remove('x', map);
  var map2 = remove('y', map1);

  t.is(map, map1);
  t.is(map, map2);
  t.true(isMutable(map));
  t.deepEqual(unwrap(map), { z: 5 });
});

test('returns the same map if the specified key is missing', t => {
  var map = set('y', 2, set('x', 3, empty<string, number>()));
  var map1 = remove('z', map);

  t.is(map, map1);
  t.deepEqual(unwrap(map), { x: 3, y: 2 });
  t.false(has('z', map1));
});
