import test from 'ava';
import { indexOf } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

let tree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  tree = createTree();
});

test('returns -1 if the key is not found', t => {
  t.is(indexOf(1, tree), -1);
});

test('returns the correct index for any valid key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    t.is(indexOf(sortedValues[i], tree), i);
  }
});
