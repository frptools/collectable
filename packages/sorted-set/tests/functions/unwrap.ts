import {RedBlackTree, fromObject, unwrap as _unwrap} from '@collectable/red-black-tree';
import {assert} from 'chai';
import {SortedSet as SortedSet, empty, fromArray, toArray, toNativeSet, unwrap} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  const values = ['A', 'B', 'C', 'D', 'E'];
  let set: SortedSet<string>;
  setup(() => {
    set = fromStringArray(values);
  });

  suite('toArray()', () => {
    test('returns an empty array if the set is empty', () => {
      assert.strictEqual(toArray(empty()).length, 0);
    });

    test('returns an array containing each member of the input set', () => {
      assert.deepEqual(toArray(set), values);
    });
  });

  suite('toNativeSet()', () => {
    test('returns an empty set if the input set is empty', () => {
      assert.strictEqual(toNativeSet(empty()).size, 0);
    });

    test('returns a native set containing each member of the input set', () => {
      assert.deepEqual(Array.from(toNativeSet(set)), values);
    });
  });

  suite('unwrap()', () => {
    let set1: SortedSet<any>, map1: RedBlackTree<any, any>, map2: RedBlackTree<any, any>;
    setup(() => {
      map1 = fromObject<string>(values);
      map2 = fromObject<string>(values);
      set1 = fromArray([map1, map2]);
    });

    test('returns an empty array if the set is empty', () => {
      assert.strictEqual(unwrap(false, empty<string>()).length, 0);
    });

    test('returns an array containing each member of the input set', () => {
      assert.deepEqual(unwrap(false, set), values);
    });

    test('if called with deep=false, the returned array does not unwrap any child collections', () => {
      assert.deepEqual(unwrap(false, set1), [map1, map2]);
    });

    test('if called with deep=true, the returned array includes recursively-unwrapped child collections', () => {
      assert.deepEqual(unwrap(true, set1), [_unwrap(true, map1), _unwrap(true, map2)]);
    });
  });
});