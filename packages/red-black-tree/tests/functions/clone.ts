import test from 'ava';
import { isImmutable, isMutable, modify, unwrap } from '@collectable/core';
import { RedBlackTreeStructure, clone, fromPairsWithStringKeys, remove, set, size } from '../../src';

let treeA: RedBlackTreeStructure<string, string>,
    treeB: RedBlackTreeStructure<string, string>,
    treeC: RedBlackTreeStructure<string, string>,
    treeD: RedBlackTreeStructure<string, string>;

test.beforeEach(() => {
  treeA = fromPairsWithStringKeys([['A', 'a'], ['B', 'b'], ['C', 'c']]);
  treeB = clone(treeA);
  treeC = modify(treeA);
  treeD = clone(treeC);
});

test('[immutable] a new mutable set is returned', t => {
  t.true(isMutable(treeC));
  t.true(isMutable(treeD));
  t.not(treeC, treeD);
});

test('[immutable] the new set has the same size as the input set', t => {
  t.is(size(treeD), size(treeC));
});

test('[immutable] the new set has all of the items in the input set', t => {
  t.deepEqual(unwrap(treeC), unwrap(treeD));
});

test('[immutable] changes made to the new set do not affect the input set', t => {
  remove('A', treeD);
  set('E', 'e', treeD);
  t.deepEqual(unwrap(treeC), { 'A': 'a', 'B': 'b', 'C': 'c' });
  t.deepEqual(unwrap(treeD), { 'B': 'b', 'C': 'c', 'E': 'e' });
});

test('[mutable] a new immutable set is returned', t => {
  t.not(treeA, treeB);
  t.true(isImmutable(treeB));
});

test('[mutable] the new set has the same size as the input set', t => {
  t.is(size(treeB), size(treeA));
});

test('[mutable] the new set has all of the items in the input set', t => {
  t.deepEqual(unwrap(treeA), unwrap(treeB));
});

test('[mutable] changes made to the new set do not affect the input set', t => {
  const tree2 = set('E', 'e', remove('A', treeB));
  t.deepEqual(unwrap(treeB), { 'A': 'a', 'B': 'b', 'C': 'c' });
  t.deepEqual(unwrap(tree2), { 'B': 'b', 'C': 'c', 'E': 'e' });
});
