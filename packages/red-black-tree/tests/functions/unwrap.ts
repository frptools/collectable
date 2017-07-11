import {assert} from 'chai';
import {unwrap} from '@collectable/core';
import {arrayFrom, fromPairsWithNumericKeys, fromPairsWithStringKeys, set, remove} from '../../src';
import {RedBlackTreeStructure} from '../../src/internals';
import {empty, createTree, sortedValues, toPair} from '../test-utils';

var tree: RedBlackTreeStructure<any, any>,
    emptyTree: RedBlackTreeStructure<any, any>,
    deepTree: RedBlackTreeStructure<any, any>;

suite('[RedBlackTree]', () => {
  setup(() => {
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

  suite('arrayFrom()', () => {
    test('returns an empty array if the tree is empty', () => {
      assert.deepEqual(arrayFrom(emptyTree), []);
    });

    test('returns an array of pairs of all entries in a single-node tree', () => {
      var tree = fromPairsWithNumericKeys([[3, 5]]);
      assert.deepEqual(arrayFrom(tree).map(toPair), [[3, 5]]);
    });

    test('returns an array of pairs of all entries in a populated tree', () => {
      assert.deepEqual<any>(arrayFrom(tree).map(toPair), sortedValues.map(n => [n, `#${n}`]));
    });

    test('returns an array of transformed values if a mapping function is provided', () => {
      const map = (v: string, k: number, i: number) => `${k};${v};${i}`;
      const expected = sortedValues.map((v, i) => map(`#${v}`, v, i));
      assert.deepEqual(arrayFrom(map, tree), expected);
    });
  });

  suite('unwrap()', () => {
    test('returns an empty object if the tree is empty', () => {
      assert.deepEqual(unwrap(emptyTree), {});
      const emptiedTree = remove(3, set(3, null, emptyTree));
      assert.deepEqual(unwrap(emptiedTree), {});
    });

    test('also unwraps embedded collections', () => {
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
      assert.deepEqual(unwrap(deepTree), expected);
    });

    test('returns an containing all entries in a single-node tree', () => {
      var tree = fromPairsWithNumericKeys([[3, 5]]);
      assert.deepEqual(unwrap(tree), {'3': 5});
    });

    test('returns an containing all entries in a populated tree', () => {
      assert.deepEqual(unwrap(tree), sortedValues.reduce((o, n) => (o[n] = `#${n}`, o), <any>{}));
    });
  });
});