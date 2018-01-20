import test from 'ava';
import { emptyWithNumericKeys, isEmpty } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>,
    emptyTree: RedBlackTreeStructure<any, any>;

test.before(() => {
  emptyTree = <RedBlackTreeStructure<any, any>>emptyWithNumericKeys();
  tree = createTree();
});

test('returns true if the tree is empty', t => {
  t.true(isEmpty(emptyTree));
});

test('returns false if the tree is not empty', t => {
  t.false(isEmpty(tree));
});
