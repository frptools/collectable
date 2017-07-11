import {assert} from 'chai';
import {isMutable, isImmutable, modify} from '@collectable/core';
import {updateMap, clone} from '../../src';
import {SortedMap, fromStringArray} from '../test-utils';

suite('[SortedMap]', () => {
  suite('updateMap()', () => {
    let map: SortedMap;
    suite('if the input map is mutable', () => {
      setup(() => {
        map = modify(fromStringArray(['A', 'B', 'C']));
      });

      test('the input map is passed to the predicate', () => {
        let called = false;
        updateMap(s => {
          called = true;
          assert.strictEqual(s, map);
        }, map);
        assert.isTrue(called);
      });

      test('returns the input map if nothing is returned from the predicate', () => {
        const result = updateMap(s => {}, map);
        assert.strictEqual(result, map);
      });

      test('returns the return value of the predicate, if defined', () => {
        const result = updateMap(s => clone(s), map);
        assert.notStrictEqual(result, map);
      });

      test('if the input map is returned, it is still mutable', () => {
        const result = updateMap(s => s, map);
        assert.isTrue(isMutable(result));
      });
    });

    suite('if the input map is immutable', () => {
      setup(() => {
        map = fromStringArray(['A', 'B', 'C']);
      });

      test('a mutable clone of the input map is passed to the predicate', () => {
        let called = false;
        updateMap(s => {
          called = true;
          assert.notStrictEqual(s, map);
          assert.deepEqual(Array.from(s), Array.from(map));
        }, map);
        assert.isTrue(called);
      });

      test('the mutable map argument is made immutable and returned, if the predicate returns nothing', () => {
        var inner: SortedMap = <any>void 0;
        const result = updateMap(s => {
          assert.isTrue(isMutable(s));
          inner = s;
        }, map);
        assert.strictEqual(result, inner);
        assert.isTrue(isImmutable(result));
      });

      test('if the predicate returns a map instance other than the original argument, an immutable clone of it is returned', () => {
        const result = updateMap(s => {
          return modify(fromStringArray(['X', 'Y']));
        }, map);
        assert.isTrue(isImmutable(result));
        assert.deepEqual<any>(Array.from(result), [['X', 'X'.charCodeAt(0)], ['Y', 'Y'.charCodeAt(0)]]);
      });
    });
  });
});