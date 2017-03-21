import {assert} from 'chai';
import {update, thaw, isThawed, isFrozen, clone} from '../../src';
import {SortedMap, fromStringArray} from '../test-utils';

suite('[SortedMap]', () => {
  suite('update()', () => {
    let map: SortedMap;
    suite('if the input map is mutable', () => {
      setup(() => {
        map = thaw(fromStringArray(['A', 'B', 'C']));
      });

      test('the input map is passed to the predicate', () => {
        let called = false;
        update(s => {
          called = true;
          assert.strictEqual(s, map);
        }, map);
        assert.isTrue(called);
      });

      test('returns the input map if nothing is returned from the predicate', () => {
        const result = update(s => {}, map);
        assert.strictEqual(result, map);
      });

      test('returns the return value of the predicate, if defined', () => {
        const result = update(s => clone(s), map);
        assert.notStrictEqual(result, map);
      });

      test('if the input map is returned, it is still mutable', () => {
        const result = update(s => s, map);
        assert.isTrue(isThawed(result));
      });
    });

    suite('if the input map is immutable', () => {
      setup(() => {
        map = fromStringArray(['A', 'B', 'C']);
      });

      test('a mutable clone of the input map is passed to the predicate', () => {
        let called = false;
        update(s => {
          called = true;
          assert.notStrictEqual(s, map);
          assert.deepEqual(Array.from(s), Array.from(map));
        }, map);
        assert.isTrue(called);
      });

      test('the mutable map argument is made immutable and returned, if the predicate returns nothing', () => {
        var inner: SortedMap = <any>void 0;
        const result = update(s => {
          assert.isTrue(isThawed(s));
          inner = s;
        }, map);
        assert.strictEqual(result, inner);
        assert.isTrue(isFrozen(result));
      });

      test('if the predicate returns a map instance other than the original argument, an immutable clone of it is returned', () => {
        const result = update(s => {
          return thaw(fromStringArray(['X', 'Y']));
        }, map);
        assert.isTrue(isFrozen(result));
        assert.deepEqual(Array.from(result), [['X', 'X'.charCodeAt(0)], ['Y', 'Y'.charCodeAt(0)]]);
      });
    });
  });
});