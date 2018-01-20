import test from 'ava';
import { emptyWithNumericKeys, lastKey } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(lastKey(emptyTree), void 0);
});

test('returns the rightmost key', t => {
  const key = lastKey(tree);
  t.is(key, sortedValues[sortedValues.length - 1]);
});
