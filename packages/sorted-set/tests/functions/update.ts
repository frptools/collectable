import {assert} from 'chai';
import {SortedSet, update, thaw, isThawed, isFrozen, clone} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  suite('update()', () => {
    let set: SortedSet<string>;
    suite('if the input set is mutable', () => {
      setup(() => {
        set = thaw(fromStringArray(['A', 'B', 'C']));
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
        assert.isTrue(isThawed(result));
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
        var inner: SortedSet<string> = <any>void 0;
        const result = update(s => {
          assert.isTrue(isThawed(s));
          inner = s;
        }, set);
        assert.strictEqual(result, inner);
        assert.isTrue(isFrozen(result));
      });

      test('if the predicate returns a set instance other than the original argument, an immutable clone of it is returned', () => {
        const result = update(s => {
          return thaw(fromStringArray(['X', 'Y']));
        }, set);
        assert.isTrue(isFrozen(result));
        assert.deepEqual(Array.from(result), ['X', 'Y']);
      });
    });
  });
});