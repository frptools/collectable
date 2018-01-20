import test from 'ava';
import { emptyWithNumericKeys, get } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = emptyWithNumericKeys();
  tree = createTree();
});

test('returns undefined if the key does not exist in the list', t => {
  t.is(get(1, emptyTree), void 0);
});

test('returns the value associated with the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    t.is(get(sortedValues[i], tree), `#${sortedValues[i]}`);
  }
});
