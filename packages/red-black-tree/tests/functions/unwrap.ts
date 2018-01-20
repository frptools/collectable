import test from 'ava';
import { unwrap } from '@collectable/core';
import { fromPairsWithNumericKeys, fromPairsWithStringKeys, remove, set } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, empty, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<any, any>,
    emptyTree: RedBlackTreeStructure<any, any>,
    deepTree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  emptyTree = empty();
  tree = createTree();
  deepTree = fromPairsWithNumericKeys<any>([
    [2, 'X'],
    [6, 'Y'],
    [4, fromPairsWithNumericKeys<any>([
      [5, 'X'],
      [1, fromPairsWithStringKeys<any>([
        ['A', 6]
      ])],
      [3, 'B']
    ])],
    [10, 'C']
  ]);
});

test('returns an empty object if the tree is empty', t => {
  t.deepEqual(unwrap(emptyTree), {});
  const emptiedTree = remove(3, set(3, null, emptyTree));
  t.deepEqual(unwrap(emptiedTree), {});
});

test('also unwraps embedded collections', t => {
  const expected = {
    '2': 'X',
    '4': {
      '1': {
        'A': 6
      },
      '3': 'B',
      '5': 'X'
    },
    '6': 'Y',
    '10': 'C'
  };
  t.deepEqual(unwrap(deepTree), expected);
});

test('returns an containing all entries in a single-node tree', t => {
  var tree = fromPairsWithNumericKeys([[3, 5]]);
  t.deepEqual(unwrap(tree), { '3': 5 });
});

test('returns an containing all entries in a populated tree', t => {
  t.deepEqual(unwrap(tree), sortedValues.reduce((o, n) => (o[n] = `#${n}`, o), <any>{}));
});
