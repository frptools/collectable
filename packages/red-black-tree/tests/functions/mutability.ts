import test from 'ava';
import { commit, isImmutable, modify } from '@collectable/core';
import { set, values } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  tree = createTree();
});

test('committing should return the input tree', t => {
  t.is(commit(tree), tree);
});

test('committing should freeze the tree if not frozen', t => {
  var tree0 = modify(tree);
  t.true(isImmutable(commit(tree0)));
});

test('committing should cause common operations to avoid mutating the input tree', t => {
  const values1 = sortedValues.concat(9450).sort((a, b) => a - b).map(n => `#${n}`);
  const values2 = sortedValues.concat(572).sort((a, b) => a - b).map(n => `#${n}`);
  const values3 = sortedValues.concat([9450, 1]).sort((a, b) => a - b).map(n => `#${n}`);
  const tree0 = commit(modify(tree));
  const tree1 = set(9450, '#9450', tree0);
  const tree2 = set(572, '#572', tree0);
  const tree3 = set(1, '#1', tree1);
  t.not(tree, tree0);
  t.not(tree1, tree0);
  t.not(tree2, tree0);
  t.not(tree3, tree1);
  t.deepEqual(Array.from(values(tree0)), sortedValues.map(n => `#${n}`));
  t.deepEqual(Array.from(values(tree1)), values1);
  t.deepEqual(Array.from(values(tree2)), values2);
  t.deepEqual(Array.from(values(tree3)), values3);
});

test('modifying should return the same tree if already unfrozen', t => {
  const tree0 = modify(tree);
  t.is(modify(tree0), tree0);
});

test('modifying should return a new tree if frozen', t => {
  t.not(modify(tree), tree);
});

test('modifying should cause common operations to directly mutate the input tree', t => {
  const tree0 = modify(tree);
  const tree1 = set(9450, '#9450', tree0);
  const tree2 = set(572, '#572', tree0);
  const tree3 = set(1, '#1', tree1);
  t.is(tree0, tree1);
  t.is(tree0, tree2);
  t.is(tree0, tree3);
  t.deepEqual(Array.from(values(tree0)), sortedValues.concat([1, 572, 9450]).sort((a, b) => a - b).map(n => `#${n}`));
});

test('isImmutable() should return true if the tree is frozen', t => {
  t.true(isImmutable(tree));
  t.true(isImmutable(commit(modify(tree))));
});

test('isImmutable() should return false if the tree is unfrozen', t => {
  const tree0 = modify(tree);
  t.false(isImmutable(tree0));
  t.false(isImmutable(modify(commit(tree0))));
});
