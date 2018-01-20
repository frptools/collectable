import test from 'ava';
import { emptyWithNumericKeys, lastValue } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  t.is(lastValue(emptyTree), void 0);
});

test('returns the rightmost value', t => {
  const value = lastValue(tree);
  t.is(value, `#${sortedValues[sortedValues.length - 1]}`);
});
