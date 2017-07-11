import {assert} from 'chai';
import {modify, isMutable, isImmutable} from '@collectable/core';
import {SortedSetStructure, update, clone} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  suite('update()', () => {
    let set: SortedSetStructure<string>;
    suite('if the input set is mutable', () => {
      setup(() => {
        set = modify(fromStringArray(['A', 'B', 'C']));
      });

      test('the input set is passed to the predicate', () => {
        let called = false;
        update(s => {
          called = true;
          assert.strictEqual(s, set);
        }, set);
        assert.isTrue(called);
      });

      test('returns the input set if nothing is returned from the predicate', () => {
        const result = update(s => {}, set);
        assert.strictEqual(result, set);
      });

      test('returns the return value of the predicate, if defined', () => {
        const result = update(s => clone(s), set);
        assert.notStrictEqual(result, set);
      });

      test('if the input set is returned, it is still mutable', () => {
        const result = update(s => s, set);
        assert.isTrue(isMutable(result));
      });
    });

    suite('if the input set is immutable', () => {
      setup(() => {
        set = fromStringArray(['A', 'B', 'C']);
      });

      test('a mutable clone of the input set is passed to the predicate', () => {
        let called = false;
        update(s => {
          called = true;
          assert.notStrictEqual(s, set);
          assert.deepEqual(Array.from(s), Array.from(set));
        }, set);
        assert.isTrue(called);
      });

      test('the mutable set argument is made immutable and returned, if the predicate returns nothing', () => {
        var inner: SortedSetStructure<string> = <any>void 0;
        const result = update(s => {
          assert.isTrue(isMutable(s));
          inner = s;
        }, set);
        assert.strictEqual(result, inner);
        assert.isTrue(isImmutable(result));
      });

      test('if the predicate returns a set instance other than the original argument, an immutable clone of it is returned', () => {
        const result = update(s => {
          return modify(fromStringArray(['X', 'Y']));
        }, set);
        assert.isTrue(isImmutable(result));
        assert.deepEqual(Array.from(result), ['X', 'Y']);
      });
    });
  });
});