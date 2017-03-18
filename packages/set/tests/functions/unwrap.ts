import {Map, fromObject, unwrap as _unwrap} from '@collectable/map';
import {assert} from 'chai';
import {Set as HashSet, empty, fromArray, toArray, toNativeSet, unwrap} from '../../src';

suite('[Set]', () => {
  const values = ['A', 'B', 'C', 'D', 'E'];
  let set: HashSet<string>;
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
    let set1: HashSet<any>, map1: Map<any, any>, map2: Map<any, any>;
    setup(() => {
      map1 = fromObject(values);
      map2 = fromObject(values);
      set1 = fromArray([map1, map2]);
    });

    test('returns an empty array if the set is empty', () => {
      assert.strictEqual(unwrap(false, empty<string>()).length, 0);
    });

    test('returns an array containing each member of the input set', () => {
      assert.sameMembers(unwrap(false, set), values);
    });

    test('if called with deep=false, the returned array does not unwrap any child collections', () => {
      assert.sameMembers(unwrap(false, set1), [map1, map2]);
    });

    test('if called with deep=true, the returned array includes recursively-unwrapped child collections', () => {
      assert.sameDeepMembers(unwrap(true, set1), [_unwrap(true, map1), _unwrap(true, map2)]);
    });
  });
});