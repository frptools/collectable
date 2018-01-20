import test from 'ava';
import { emptyWithNumericKeys, size } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>,
    emptyTree: RedBlackTreeStructure<any, any>;

test.before(() => {
  emptyTree = <RedBlackTreeStructure<any, any>>emptyWithNumericKeys();
  tree = createTree();
});

test('returns 0 if the tree is empty', t => {
  t.is(size(emptyTree), 0);
});

test('returns the number of elements in the tree', t => {
  t.is(size(tree), sortedValues.length);
});
