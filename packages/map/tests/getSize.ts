import test from 'ava';
import { empty, remove, set, size } from '../src';

test('returns 0 when the map empty', t => {
  t.is(size(empty()), 0);
});

test('returns the correct size after adding entries', t => {
  var map1 = set('x', 1, empty());
  var map2 = set('x', 2, map1);
  var map3 = set('y', 1, map1);
  t.is(size(map1), 1);
  t.is(size(map2), 1);
  t.is(size(map3), 2);
});

test('returns the correct size after removing entries', t => {
  var map = set('x', 1, empty());
  map = set('y', 3, map);
  map = set('z', 5, map);
  t.is(size(map = remove('x', map)), 2);
  t.is(size(map = remove('y', map)), 1);
  t.is(size(remove('z', map)), 0);
});
