import test from 'ava';
import { RedBlackTreeEntry, emptyWithNumericKeys, first } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(first(emptyTree), void 0);
});

test('returns a pointer to the first node', t => {
  const node = <RedBlackTreeEntry<any, any>>first(tree);
  t.not(node, void 0);
  t.is(node.key, sortedValues[0]);
});
