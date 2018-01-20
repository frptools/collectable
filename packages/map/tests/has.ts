import test from 'ava';
import { empty, has, remove, set } from '../src';

test('returns true if the specified property exists', t => {
  var map = set('x', 3, empty<string, number>());
  t.true(has('x', map));
});

test('returns false if the specified property is missing', t => {
  var map = set('x', 3, empty<string, number>());
  t.false(has('y', map));
});

test('returns true after assigning a property to a mutable map', t => {
  var map = empty<string, number>(true);
  t.false(has('x', map));
  set('x', 3, map);
  t.true(has('x', map));
});

test('return false after removing a property from a mutable map', t => {
  var map = set('x', 3, empty<string, number>(true));
  t.true(has('x', map));
  remove('x', map);
  t.false(has('x', map));
});
