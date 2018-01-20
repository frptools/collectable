import test from 'ava';
import { fromStringKeys, size } from '../../src';
import { unwrap } from '@collectable/core';

test('returns a tree containing the keys in a source array', t => {
  const source = ['a', 'b', 'c'];
  const tree = fromStringKeys(source);
  t.is(size(tree), 3);
  t.deepEqual(unwrap(tree), { a: null, b: null, c: null });
});
