import test from 'ava';
import { keyAt } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, empty, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = empty();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(keyAt(0, emptyTree), void 0);
});

test('returns undefined if the index is out of range', t => {
  t.is(keyAt(sortedValues.length, tree), void 0);
});

test('returns the key at the specified index (negative index offset from the right)', t => {
  t.is(keyAt(25, tree), sortedValues[25]);
});
