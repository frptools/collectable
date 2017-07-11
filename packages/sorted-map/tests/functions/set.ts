import {assert} from 'chai';
import {isMutable, isImmutable, modify} from '@collectable/core';
import {set, has, size} from '../../src';
import {SortedMap, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  suite('set()', () => {
    suite('when the item already exists in the map', () => {
      let map0: SortedMap, map1: SortedMap;
      setup(() => {
        map0 = fromStringArray(['D', 'A', 'B']);
        map1 = set('B', 'B'.charCodeAt(0), map0);
      });

      test('the map size does not change', () => {
        assert.strictEqual(size(map0), 3);
        assert.strictEqual(size(map1), 3);
      });

      test('the input map is returned', () => {
        assert.strictEqual(map0, map1);
      });

      test('the specified item can still be retrieved from the map', () => {
        assert.isTrue(has('B', map1));
      });
    });

    suite('when the item does not exist in the map', () => {
      let map0: SortedMap, map1: SortedMap;
      suite('if the input map is mutable', () => {
        suiteSetup(() => {
          map0 = modify(fromStringArray(['A', 'B', 'D']));
          map1 = set('C', 'C'.charCodeAt(0), map0);
        });

        test('the input map is returned', () => {
          assert.strictEqual(map0, map1);
        });

        test('the input map is still mutable', () => {
          assert.isTrue(isMutable(map1));
        });

        test('the map size is incremented', () => {
          assert.strictEqual(size(map1), 4);
        });

        test('the seted item can be retrieved from the map', () => {
          assert.isTrue(has('C', map1));
        });

        test('all expected members exist in the map in the correct order', () => {
          assert.deepEqual(Array.from(map1), pairsFrom(['A', 'B', 'C', 'D']));
        });
      });

      suite('if the input map is immutable', () => {
        suiteSetup(() => {
          map0 = fromStringArray(['A', 'B', 'D']);
          map1 = set('C', 'C'.charCodeAt(0), map0);
        });

        test('the input map is not modified', () => {
          assert.deepEqual(Array.from(map0), pairsFrom(['A', 'B', 'D']));
          assert.strictEqual(size(map0), 3);
          assert.isTrue(isImmutable(map0));
        });

        test('a new immutable map is returned', () => {
          assert.isTrue(isImmutable(map1));
        });

        test('the size of the new map is one greater than that of the input map', () => {
          assert.strictEqual(size(map1), 4);
        });

        test('the new map has all of the items in the input map', () => {
          for(let c of Array.from(map0)) {
            assert.isTrue(has(c[0], map1));
          }
        });

        test('the seted item can be retrieved from the new map', () => {
          assert.isTrue(has('C', map1));
        });

        test('all expected members exist in the new map in the correct order', () => {
          assert.deepEqual(Array.from(map1), pairsFrom(['A', 'B', 'C', 'D']));
        });
      });
    });
  });
});