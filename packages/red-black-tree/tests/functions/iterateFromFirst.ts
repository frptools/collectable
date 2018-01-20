import test from 'ava';
import { emptyWithNumericKeys, iterateFromFirst } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns a reverse iterator starting from the leftmost node', t => {
  const it = iterateFromFirst(tree);
  t.deepEqual(Array.from(it).map(n => n.key), sortedValues);
});

test('the iterator should be in a completed state if the tree is empty', t => {
  const it = iterateFromFirst(emptyTree);
  t.true(it.next().done);
});
