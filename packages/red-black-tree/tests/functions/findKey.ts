import test from 'ava';
import { RedBlackTreeEntry, find, findKey } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, empty, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<number, string>,
    emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = empty();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  const akey = findKey('gt', sortedValues[0], emptyTree);
  const lkey = findKey('gte', sortedValues[25], emptyTree);
  const rkey = findKey('lt', sortedValues[sortedValues.length - 25], emptyTree);
  const zkey = findKey('lte', sortedValues[sortedValues.length - 1], emptyTree);
  t.is(akey, void 0);
  t.is(lkey, void 0);
  t.is(rkey, void 0);
  t.is(zkey, void 0);
});

test('returns the key of the node that best matches the condition', t => {
  const anode = <RedBlackTreeEntry<any, any>>find('gt', sortedValues[0], tree);
  const akey = findKey('gt', sortedValues[0], tree);
  const lnode = <RedBlackTreeEntry<any, any>>find('gte', sortedValues[25], tree);
  const lkey = findKey('gte', sortedValues[25], tree);
  const rnode = <RedBlackTreeEntry<any, any>>find('lt', sortedValues[sortedValues.length - 25], tree);
  const rkey = findKey('lt', sortedValues[sortedValues.length - 25], tree);
  const znode = <RedBlackTreeEntry<any, any>>find('lte', sortedValues[sortedValues.length - 1], tree);
  const zkey = findKey('lte', sortedValues[sortedValues.length - 1], tree);
  t.is(akey, anode.key);
  t.is(lkey, lnode.key);
  t.is(rkey, rnode.key);
  t.is(zkey, znode.key);
});
