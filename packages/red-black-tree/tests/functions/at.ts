import test from 'ava';
import { RedBlackTreeEntry, at } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, empty, sortedValues } from '../test-utils';

let tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = empty();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(at(0, emptyTree), void 0);
});

test('returns undefined if the index is out of range', t => {
  t.is(at(sortedValues.length, tree), void 0);
});

test('returns a pointer to the node at the specified index (negative index offset from the right)', t => {
  const node0 = <RedBlackTreeEntry<any, any>>at(25, tree);
  t.not(node0, void 0);
  t.is(node0.key, sortedValues[25]);
  t.is(node0.value, `#${sortedValues[25]}`);
  const node1 = <RedBlackTreeEntry<any, any>>at(200, tree);
  t.not(node1, void 0);
  t.is(node1.key, sortedValues[200]);
  t.is(node1.value, `#${sortedValues[200]}`);
  const node2 = <RedBlackTreeEntry<any, any>>at(-25, tree);
  t.not(node2, void 0);
  t.is(node2.key, sortedValues[sortedValues.length - 25]);
  t.is(node2.value, `#${sortedValues[sortedValues.length - 25]}`);
});
