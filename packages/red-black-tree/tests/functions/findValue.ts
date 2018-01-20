import test from 'ava';
import { RedBlackTreeEntry, find, findValue } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, empty, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<number, string>,
    emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = empty();
  tree = createTree();
});

test('returns undefined if the tree is empty', t => {
  const avalue = findValue('gt', sortedValues[0], emptyTree);
  const lvalue = findValue('gte', sortedValues[25], emptyTree);
  const rvalue = findValue('lt', sortedValues[sortedValues.length - 25], emptyTree);
  const zvalue = findValue('lte', sortedValues[sortedValues.length - 1], emptyTree);
  t.is(avalue, void 0);
  t.is(lvalue, void 0);
  t.is(rvalue, void 0);
  t.is(zvalue, void 0);
});

test('returns the value of the node that best matches the condition', t => {
  const anode = <RedBlackTreeEntry<any, any>>find('gt', sortedValues[0], tree);
  const avalue = findValue('gt', sortedValues[0], tree);
  const lnode = <RedBlackTreeEntry<any, any>>find('gte', sortedValues[25], tree);
  const lvalue = findValue('gte', sortedValues[25], tree);
  const rnode = <RedBlackTreeEntry<any, any>>find('lt', sortedValues[sortedValues.length - 25], tree);
  const rvalue = findValue('lt', sortedValues[sortedValues.length - 25], tree);
  const znode = <RedBlackTreeEntry<any, any>>find('lte', sortedValues[sortedValues.length - 1], tree);
  const zvalue = findValue('lte', sortedValues[sortedValues.length - 1], tree);
  t.is(avalue, anode.value);
  t.is(lvalue, lnode.value);
  t.is(rvalue, rnode.value);
  t.is(zvalue, znode.value);
});
