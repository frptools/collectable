import test from 'ava';
import { empty, get, set } from '../../src';
import { isMutable, unwrap } from '@collectable/core';

test('returns the value with the specified key', t => {
  var map = set('x', 3, empty<string, number>());

  t.is(get('x', map), 3);

  t.false(isMutable(map));
  t.deepEqual(unwrap(map), { x: 3 });
});

test('returns undefined if the specified key is missing', t => {
  var map = set('x', 3, empty<string, number>());

  t.is(get('y', map), void 0);

  t.false(isMutable(map));
  t.deepEqual(unwrap(map), { x: 3 });
});
