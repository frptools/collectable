import test from 'ava';
import { emptyWithNumericKeys, iterateFromLast } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns a reverse iterator starting from the rightmost node', t => {
  const it = iterateFromLast(tree);
  const expected = sortedValues.slice().reverse();
  t.deepEqual(Array.from(it).map(n => n.key), expected);
});

test('the iterator should be in a completed state if the tree is empty', t => {
  const it = iterateFromLast(emptyTree);
  t.true(it.next().done);
});
