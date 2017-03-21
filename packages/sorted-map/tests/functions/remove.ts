import {assert} from 'chai';
import {remove, has, size, thaw, isThawed, isFrozen} from '../../src';
import {SortedMap, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  suite('remove()', () => {
    let map0: SortedMap, map1: SortedMap;
    suite('when the item does not exist in the map', () => {
      setup(() => {
        map0 = fromStringArray(['A', 'B', 'C']);
        map1 = remove('D', map0);
      });

      test('the map size does not change', () => {
        assert.strictEqual(size(map1), 3);
      });

      test('the input map is returned unmodified', () => {
        assert.strictEqual(map0, map1);
      });

      test('the item is still unretrievable from the map', () => {
        assert.isFalse(has('D', map1));
      });
    });

    suite('when the item exists in the map', () => {
      const values0 = ['A', 'B', 'C', 'D', 'E'];
      const values1 = ['A', 'B', 'D', 'E'];
      suite('if the input map is mutable', () => {
        suiteSetup(() => {
          map0 = thaw(fromStringArray(values0));
          map1 = remove('C', map0);
        });

        test('the input map is returned', () => {
          assert.strictEqual(map0, map1);
        });

        test('the input map is still mutable', () => {
          assert.isTrue(isThawed(map0));
        });

        test('the input map size is decremented', () => {
          assert.strictEqual(size(map0), values1.length);
        });

        test('the removed item can no longer be retrieved from the input map', () => {
          assert.isFalse(has('C', map0));
        });

        test('the input map still contains all items other than the removed item', () => {
          assert.deepEqual(Array.from(map0), pairsFrom(values1));
        });
      });

      suite('if the input map is mutable', () => {
        suiteSetup(() => {
          map0 = fromStringArray(values0);
          map1 = remove('C', map0);
        });

        test('the input map is not modified', () => {
          assert.strictEqual(size(map0), values0.length);
          assert.deepEqual(Array.from(map0), pairsFrom(values0));
          assert.isTrue(isFrozen(map0));
        });

        test('a new immutable map is returned', () => {
          assert.notStrictEqual(map0, map1);
          assert.isTrue(isFrozen(map1));
        });

        test('the size of the new map is one less than that of the input map', () => {
          assert.strictEqual(size(map1), values1.length);
        });

        test('the removed item can no longer be retrieved from the new map', () => {
          assert.isFalse(has('C', map1));
        });

        test('the new map contains all items from the input map other than the removed item', () => {
          assert.deepEqual(Array.from(map1), pairsFrom(values1));
        });
      });
    });
  });
});