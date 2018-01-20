import test from 'ava';
import { isMutable, unwrap } from '@collectable/core';
import { empty, set, update } from '../src';

test('returns a new map with the specified key updated', t => {
  var map = set('x', 3, empty<string, number>());

  var map1 = update(x => {
    t.is(x, 3);
    return 2;
  }, 'x', map);

  var map2 = update(y => {
    t.is(y, void 0);
    return 2;
  }, 'y', map);

  t.false(isMutable(map));
  t.false(isMutable(map1));
  t.false(isMutable(map2));
  t.not(map, map1);
  t.not(map, map2);
  t.not(map1, map2);
  t.deepEqual(unwrap(map), { x: 3 });
  t.deepEqual(unwrap(map1), { x: 2 });
  t.deepEqual(unwrap(map2), { x: 3, y: 2 });
});

test('returns the same map if the returned value is unchanged', t => {
  var map = set('x', 3, empty<string, number>());
  var map1 = update(x => 3, 'x', map);
  var map2 = update(y => void 0, 'y', map);

  t.false(isMutable(map));
  t.is(map, map1);
  t.is(map, map2);
  t.false('y' in unwrap(map));
  t.deepEqual(unwrap(map), { x: 3 });
});

test('returns the same map if the original map is already mutable', t => {
  var map = set('x', 3, empty<string, number>(true));

  t.true(isMutable(map));
  t.deepEqual(unwrap(map), { x: 3 });

  var map1 = update(y => 2, 'y', map);

  t.is(map, map1);
  t.true(isMutable(map1));
  t.deepEqual(unwrap(map1), { x: 3, y: 2 });
});
