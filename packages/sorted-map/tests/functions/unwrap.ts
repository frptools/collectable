import {RedBlackTree, fromObject, unwrap as _unwrap} from '@collectable/red-black-tree';
import {assert} from 'chai';
import {empty, fromArray, toArray, toNativeMap, unwrap} from '../../src';
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
    let map1: SortedMap, tree1: RedBlackTree<any, any>, tree2: RedBlackTree<any, any>;
    setup(() => {
      tree1 = fromObject<string>(values);
      tree2 = fromObject<string>(values);
      map1 = fromArray<string, RedBlackTree<any, any>>([['A', tree1], ['B', tree2]]);
    });

    test('returns an empty object if the map is empty', () => {
      assert.deepEqual(unwrap(false, empty<string, number>()), {});
    });

    test('returns an array containing each member of the input map', () => {
      assert.deepEqual(unwrap(false, map), values.reduce((o, v) => (o[v] = v.charCodeAt(0), o), {}));
    });

    test('if called with deep=false, the returned array does not unwrap any child collections', () => {
      assert.deepEqual(unwrap(false, map1), {A: tree1, B: tree2});
    });

    test('if called with deep=true, the returned array includes recursively-unwrapped child collections', () => {
      assert.deepEqual(unwrap(true, map1), {A: _unwrap(true, tree1), B: _unwrap(true, tree2)});
    });
  });
});