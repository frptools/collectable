import {assert} from 'chai';
import {isEqual} from '../../src';
import {SortedMap, fromStringArray} from '../test-utils';

suite('[SortedMap]', () => {
  suite('isEqual()', () => {
    const values0 = ['A', 'B', 'C', 'D', 'E'];
    const values2 = ['A', 'B', 'C', 'D'];
    const values3 = ['x', 'A', 'B', 'C', 'D', 'E'];
    let map0: SortedMap,
        map1: SortedMap,
        map2: SortedMap,
        map3: SortedMap;
    suiteSetup(() => {
      map0 = fromStringArray(values0);
      map1 = fromStringArray(values0.slice()); // ensure the implementation doesn't retain the same array internally
      map2 = fromStringArray(values2);
      map3 = fromStringArray(values3);
    });

    test('returns true if both inputs contain equivalent maps of items', () => {
      assert.isTrue(isEqual(map0, map1));
    });

    test('returns false if either input contains items that cannot be found in the other', () => {
      assert.isFalse(isEqual(map0, map2));
      assert.isFalse(isEqual(map1, map2));
      assert.isFalse(isEqual(map0, map3));
      assert.isFalse(isEqual(map1, map3));
      assert.isFalse(isEqual(map2, map3));
    });
  });
});