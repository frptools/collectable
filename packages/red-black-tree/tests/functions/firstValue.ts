import test from 'ava';
import { emptyWithNumericKeys, firstValue } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(firstValue(emptyTree), void 0);
});

test('returns the leftmost value', t => {
  const value = firstValue(tree);
  t.is(value, `#${sortedValues[0]}`);
});
