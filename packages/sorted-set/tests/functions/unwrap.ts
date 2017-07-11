import {unwrap} from '@collectable/core';
import {RedBlackTreeStructure, fromObject} from '@collectable/red-black-tree';
import {assert} from 'chai';
import {SortedSetStructure as SortedSet, empty, fromArray, toArray, toNativeSet} from '../../src';
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
    let set1: SortedSet<any>, map1: RedBlackTreeStructure<any, any>, map2: RedBlackTreeStructure<any, any>;
    setup(() => {
      map1 = fromObject<string>(values);
      map2 = fromObject<string>(values);
      set1 = fromArray([map1, map2]);
    });

    test('returns an empty array if the set is empty', () => {
      assert.strictEqual(unwrap<string[]>(empty<string>()).length, 0);
    });

    test('returns an array containing each member of the input set', () => {
      assert.sameMembers(unwrap<string[]>(set), values);
    });

    test('the returned array includes recursively-unwrapped child collections', () => {
      assert.deepEqual(unwrap(set1), [unwrap(map1), unwrap(map2)]);
    });
  });
});