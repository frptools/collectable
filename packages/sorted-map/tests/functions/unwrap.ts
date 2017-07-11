import {assert} from 'chai';
import {RedBlackTreeStructure, fromObject} from '@collectable/red-black-tree';
import {unwrap} from '@collectable/core';
import {empty, fromArray, toArray, toNativeMap} from '../../src';
import {SortedMap, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  const values = ['A', 'B', 'C', 'D', 'E'];
  let map: SortedMap;
  setup(() => {
    map = fromStringArray(values);
  });

  suite('toArray()', () => {
    test('returns an empty array if the map is empty', () => {
      assert.strictEqual(toArray(empty()).length, 0);
    });

    test('returns an array containing each member of the input map', () => {
      assert.deepEqual(toArray(map), pairsFrom(values));
    });
  });

  suite('toNativeMap()', () => {
    test('returns an empty map if the input map is empty', () => {
      assert.strictEqual(toNativeMap(empty()).size, 0);
    });

    test('returns a native map containing each member of the input map', () => {
      assert.deepEqual(Array.from(toNativeMap(map)), pairsFrom(values));
    });
  });

  suite('unwrap()', () => {
    let map1: SortedMap, tree1: RedBlackTreeStructure<any, any>, tree2: RedBlackTreeStructure<any, any>;
    setup(() => {
      tree1 = fromObject<string>(values);
      tree2 = fromObject<string>(values);
      map1 = fromArray<string, RedBlackTreeStructure<any, any>>([['A', tree1], ['B', tree2]]);
    });

    test('returns an empty object if the map is empty', () => {
      assert.deepEqual(unwrap(empty<string, number>()), {});
    });

    test('returns an array containing each member of the input map', () => {
      assert.deepEqual(unwrap(map), values.reduce((o, v) => (o[v] = v.charCodeAt(0), o), <any>{}));
    });

    test('the returned array includes recursively-unwrapped child collections', () => {
      assert.deepEqual(unwrap(map1), {A: unwrap(tree1), B: unwrap(tree2)});
    });
  });
});