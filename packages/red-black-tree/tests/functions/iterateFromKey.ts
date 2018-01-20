import test from 'ava';
import { iterateFromKey } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  tree = createTree();
});

test('returns an iterator starting from the specified key', t => {
  const it = iterateFromKey(false, sortedValues[5], tree);
  t.deepEqual(Array.from(it).map(n => n.key), sortedValues.slice(5));
});
