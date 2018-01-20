import test from 'ava';
import { modify } from '@collectable/core';
import { fromPairsWithNumericKeys, has, size, update } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { arrayFrom, createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>,
    mixedTree: RedBlackTreeStructure<number, any>;

test.beforeEach(() => {
  tree = createTree();
  mixedTree = <RedBlackTreeStructure<number, any>>fromPairsWithNumericKeys<any>([[2, 'X'], [4, { foo: 'bar' }], [6, 123]]);
});

test('returns the same tree if no changes are made to the specified value', t => {
  t.is(update(c => 'X', 2, mixedTree), mixedTree);
  t.is(update(o => o, 4, mixedTree), mixedTree);
  t.is(update(n => 123, 6, mixedTree), mixedTree);
});

test('if the returned value is not undefined and the key was previously absent from the tree, the new key and value is inserted', t => {
  const tree0 = update(v => {
    t.is(v, void 0);
    return `#1`;
  }, 1, tree);
  t.true(has(1, tree0));
  t.is(size(tree0), size(tree) + 1);
});

test('if the returned value is undefined and the key was previously in the tree, it is removed from the tree', t => {
  const tree0 = update(v => {
    t.not(v, void 0);
    return void 0;
  }, sortedValues[1], tree);
  t.false(has(sortedValues[1], tree0));
  t.is(size(tree0), size(tree) - 1);
});

test('returns a new tree if the new value is different to the existing value', t => {
  const tree1 = update(c => 'K', 2, mixedTree);
  const tree2 = update(o => ({ foo: 'baz' }), 4, mixedTree);
  const tree3 = update(n => 42, 6, mixedTree);
  t.not(mixedTree, tree1);
  t.not(mixedTree, tree2);
  t.not(mixedTree, tree3);
  t.deepEqual<any>(arrayFrom(tree1), [[2, 'K'], [4, { foo: 'bar' }], [6, 123]]);
  t.deepEqual<any>(arrayFrom(tree2), [[2, 'X'], [4, { foo: 'baz' }], [6, 123]]);
  t.deepEqual<any>(arrayFrom(tree3), [[2, 'X'], [4, { foo: 'bar' }], [6, 42]]);
});

test('returns the same tree, modified with the updated value, if the tree was not currently frozen', t => {
  const tree0 = modify(mixedTree);
  const tree1 = update(c => 'K', 2, tree0);
  const tree2 = update(o => ({ foo: 'baz' }), 4, tree0);
  const tree3 = update(n => 42, 6, tree0);
  t.is(tree0, tree1);
  t.is(tree0, tree2);
  t.is(tree0, tree3);
  t.deepEqual<any>(arrayFrom(tree0), [[2, 'K'], [4, { foo: 'baz' }], [6, 42]]);
});
