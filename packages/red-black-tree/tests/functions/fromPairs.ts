import test from 'ava';
import { fromPairsWithStringKeys, size } from '../../src';
import { unwrap } from '@collectable/core';

test('returns a tree that matches the pairs in the source array', t => {
  const source: [string, number][] = [['a', 1], ['b', 2], ['c', 3]];
  const tree = fromPairsWithStringKeys<number>(source);
  t.is(size(tree), 3);
  t.deepEqual(unwrap(tree), { a: 1, b: 2, c: 3 });
});
