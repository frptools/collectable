import {unwrap} from '@collectable/core';
import {HashMap, fromObject} from '@collectable/map';
import {assert} from 'chai';
import {HashSetStructure, empty, fromArray, toArray, toNativeSet} from '../../src';

suite('[HashSet]', () => {
  const values = ['A', 'B', 'C', 'D', 'E'];
  let set: HashSetStructure<string>;
  setup(() => {
    set = fromArray(values);
  });

  suite('toArray()', () => {
    test('returns an empty array if the set is empty', () => {
      assert.strictEqual(toArray(empty()).length, 0);
    });

    test('returns an array containing each member of the input set', () => {
      assert.sameMembers(toArray(set), values);
    });
  });

  suite('toNativeSet()', () => {
    test('returns an empty set if the input set is empty', () => {
      assert.strictEqual(toNativeSet(empty()).size, 0);
    });

    test('returns a native set containing each member of the input set', () => {
      assert.sameMembers(Array.from(toNativeSet(set)), values);
    });
  });

  suite('unwrap()', () => {
    let set1: HashSetStructure<any>, map1: HashMap.Instance<any, any>, map2: HashMap.Instance<any, any>;
    setup(() => {
      map1 = fromObject(values);
      map2 = fromObject(values);
      set1 = fromArray([map1, map2]);
    });

    test('returns an empty array if the set is empty', () => {
      assert.strictEqual(unwrap<any[]>(empty<string>()).length, 0);
    });

    test('returns an array containing each member of the input set', () => {
      assert.sameMembers(unwrap<any[]>(set), values);
    });

    test('the returned array includes recursively-unwrapped child collections', () => {
      assert.sameDeepMembers(unwrap<any[]>(set1), [unwrap(map1), unwrap(map2)]);
    });
  });
});