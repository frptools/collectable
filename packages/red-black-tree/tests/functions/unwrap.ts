import {assert} from 'chai';
import {arrayFrom, fromPairs, unwrap} from '../../src';
import {RedBlackTreeImpl} from '../../src/internals';
import {empty, createTree, sortedValues, toPair} from '../test-utils';

var tree: RedBlackTreeImpl<any, any>,
    emptyTree: RedBlackTreeImpl<any, any>,
    deepTree: RedBlackTreeImpl<any, any>;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
    deepTree = <RedBlackTreeImpl<number, any>>fromPairs<number, any>([
      [2, 'X'],
      [6, 'Y'],
      [4, fromPairs<number, any>([
        [5, 'X'],
        [1, fromPairs([
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
      var tree = fromPairs([[3, 5]]);
      assert.deepEqual(arrayFrom(tree).map(toPair), [[3, 5]]);
    });

    test('returns an array of pairs of all entries in a populated tree', () => {
      assert.deepEqual(arrayFrom(tree).map(toPair), sortedValues.map(n => [n, `#${n}`]));
    });

    test('returns an array of transformed values if a mapping function is provided', () => {
      const map = (v, k, i) => `${k};${v};${i}`;
      const expected = sortedValues.map((v, i) => map(`#${v}`, v, i));
      assert.deepEqual(arrayFrom(map, tree), expected);
    });
  });

  suite('unwrap()', () => {
    test('returns an empty array if the tree is empty', () => {
      assert.deepEqual(unwrap(false, emptyTree), {});
    });

    test('also unwraps embedded collections if deep == true', () => {
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
      assert.deepEqual(unwrap(true, deepTree), expected);
    });

    test('returns an array of all entries in a single-node tree', () => {
      var tree = fromPairs([[3, 5]]);
      assert.deepEqual(unwrap(false, tree), {'3': 5});
    });

    test('returns an array of all entries in a populated tree', () => {
      assert.deepEqual(unwrap(false, tree), sortedValues.reduce((o, n) => (o[n] = `#${n}`, o), {}));
    });
  });
});