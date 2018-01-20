import test from 'ava';
import { isMutable, unwrap } from '@collectable/core';
import { empty, has, set } from '../src';

test('returns a new map if the original map is immutable', t => {
  var map = set('x', 3, empty<string, number>());
  var map1 = set('y', 2, map);

  t.not(map, map1);
});

test('returns the same map if the original map is mutable', t => {
  var map = set('x', 3, empty<string, number>(true));
  var map1 = set('y', 2, map);

  t.is(map, map1);
});

test('assigns the specified value to a new map each time it is called on an immutable map', t => {
  var map = empty<string, number>();
  var map1 = set('x', 3, map);
  var map2 = set('y', 2, map1);
  var map3 = set('x', 1, map2);

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

  t.deepEqual(unwrap(map), {});
  t.deepEqual(unwrap(map1), { x: 3 });
  t.deepEqual(unwrap(map2), { x: 3, y: 2 });
  t.deepEqual(unwrap(map3), { x: 1, y: 2 });
});

test('assigns the specified value to the same map each time it is called on a mutable map', t => {
  var map = empty<string, number>(true);
  var map1 = set('x', 3, map);
  var map2 = set('y', 2, map1);
  var map3 = set('x', 1, map2);

  t.is(map, map1);
  t.is(map, map2);
  t.is(map, map3);
  t.true(isMutable(map));
  t.deepEqual(unwrap(map), { x: 1, y: 2 });
});

test('returns the same map if the specified value is unchanged', t => {
  var map = set('y', 2, set('x', 3, empty<string, number>()));

  t.deepEqual(unwrap(map), { x: 3, y: 2 });

  var map1 = set('x', 4, map);
  var map2 = set('x', 4, map1);

  t.not(map, map1);
  t.is(map1, map2);
});

test('removes the specified key if the value is undefined', t => {
  var map = set('y', 2, set('x', 3, empty<string, number>()));

  t.deepEqual(unwrap(map), { x: 3, y: 2 });

  var map1 = set('x', void 0, map);

  t.not(map, map1);
  t.false(has('x', map1));
  t.deepEqual(unwrap(map), { x: 3, y: 2 });
  t.deepEqual(unwrap(map1), { y: 2 });
});

test('adds many values to the same mutable map', t => {
  var values: [string, number][] = [];
  var map = empty<string, number>(true);
  for(var i = 0, c = 'a'.charCodeAt(0); i < 26; i++, c++) {
    var entry: [string, number] = [String.fromCharCode(c), i*2 + 1];
    values.push(entry);
    set(entry[0], entry[1], map);
    t.deepEqual(Array.from(map).sort(), values);
  }
});

test('adds many values to successive copies of an immutable map', t => {
  var values: [string, number][] = [];
  var map = empty<string, number>();
  for(var i = 0, c = 'a'.charCodeAt(0); i < 26; i++, c++) {
    var entry: [string, number] = [String.fromCharCode(c), i*2 + 1];
    values.push(entry);
    map = set(entry[0], entry[1], map);
    t.deepEqual(Array.from(map).sort(), values);
  }
});
