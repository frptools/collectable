import {assert} from 'chai';
import {set, remove, size, clone} from '../../src';
import {extractMap} from '../../src/internals';
import {isImmutable, isMutable, modify} from '@collectable/core';
import {SortedMap, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  suite('clone()', () => {
    suite('when the input map is immutable', () => {
      let map0: SortedMap, map1: SortedMap;
      setup(() => {
        map0 = fromStringArray(['A', 'B', 'C']);
        map1 = clone(map0);
      });

      test('a new immutable map is returned', () => {
        assert.notStrictEqual(map0, map1);
        assert.isTrue(isImmutable(map1));
      });

      test('the new map has the same size as the input map', () => {
        assert.strictEqual(size(map1), size(map0));
      });

      test('the new map has all of the items in the input map', () => {
        assert.deepEqual(Array.from(map0), Array.from(map1));
      });

      test('changes made to the new map do not affect the input map', () => {
        const map2 = set('E', 'E'.charCodeAt(0), remove('A', map1));
        assert.deepEqual(Array.from(map1), pairsFrom(['A', 'B', 'C']));
        assert.deepEqual(Array.from(map2), pairsFrom(['B', 'C', 'E']));
      });
    });

    suite('when the input map is mutable', () => {
      let map0: SortedMap, map1: SortedMap;
      setup(() => {
        map0 = modify(fromStringArray(['A', 'B', 'C']));
        map1 = clone(map0);
      });

      test('a new mutable set is returned', () => {
        assert.isTrue(isMutable(map0));
        assert.isTrue(isMutable(map1));
        assert.notStrictEqual(map0, map1);
        assert.notStrictEqual(extractMap(map0), extractMap(map1));
      });

      test('the new map has the same size as the input map', () => {
        assert.strictEqual(size(map1), size(map0));
      });

      test('the new map has all of the items in the input map', () => {
        assert.deepEqual(Array.from(map0), Array.from(map1));
      });

      test('changes made to the new map do not affect the input map', () => {
        remove('A', map1);
        set('E', 'E'.charCodeAt(0), map1);
        assert.deepEqual(Array.from(map0), pairsFrom(['A', 'B', 'C']));
        assert.deepEqual(Array.from(map1), pairsFrom(['B', 'C', 'E']));
      });
    });
  });
});