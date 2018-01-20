import test from 'ava';
import { emptyWithNumericKeys, firstKey } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(firstKey(emptyTree), void 0);
});

test('returns the leftmost key', t => {
  const key = firstKey(tree);
  t.is(key, sortedValues[0]);
});
