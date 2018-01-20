import test from 'ava';
import { RedBlackTreeEntry, emptyWithNumericKeys, last } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(last(emptyTree), void 0);
});

test('returns a pointer to the last node', t => {
  const node = <RedBlackTreeEntry<any, any>>last(tree);
  t.not(node, void 0);
  t.is(node.key, sortedValues[sortedValues.length - 1]);
});
