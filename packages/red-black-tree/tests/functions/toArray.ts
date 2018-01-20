import test from 'ava';
import { fromPairsWithNumericKeys, toArray } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, empty, sortedValues, toPair } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>,
    emptyTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = empty();
  tree = createTree();
});

test('returns an empty array if the tree is empty', t => {
  t.deepEqual(toArray(emptyTree), []);
});

test('returns an array of pairs of all entries in a single-node tree', t => {
  var tree = fromPairsWithNumericKeys([[3, 5]]);
  t.deepEqual(toArray(tree).map(toPair), [[3, 5]]);
});

test('returns an array of pairs of all entries in a populated tree', t => {
  t.deepEqual<any>(toArray(tree).map(toPair), sortedValues.map(n => [n, `#${n}`]));
});

test('returns an array of transformed values if a mapping function is provided', t => {
  const map = (v: string, k: number, i: number) => `${k};${v};${i}`;
  const expected = sortedValues.map((v, i) => map(`#${v}`, v, i));
  t.deepEqual(toArray(map, tree), expected);
});
