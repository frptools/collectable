import {assert} from 'chai';
import {SortedSet, isFrozen, isThawed, add, remove, size, clone, thaw} from '../../src';
import {extractMap} from '../../src/internals';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  suite('clone()', () => {
    suite('when the input set is immutable', () => {
      let set0: SortedSet<string>, set1: SortedSet<string>;
      setup(() => {
        set0 = fromStringArray(['A', 'B', 'C']);
        set1 = clone(set0);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(set0, set1);
        assert.isTrue(isFrozen(set1));
      });

      test('the new set has the same size as the input set', () => {
        assert.strictEqual(size(set1), size(set0));
      });

      test('the new set has all of the items in the input set', () => {
        assert.deepEqual(Array.from(set0), Array.from(set1));
      });

      test('changes made to the new set do not affect the input set', () => {
        const set2 = add('E', remove('A', set1));
        assert.deepEqual(Array.from(set1), ['A', 'B', 'C']);
        assert.deepEqual(Array.from(set2), ['B', 'C', 'E']);
      });
    });

    suite('when the input set is mutable', () => {
      let set0: SortedSet<string>, set1: SortedSet<string>;
      setup(() => {
        set0 = thaw(fromStringArray(['A', 'B', 'C']));
        set1 = clone(set0);
      });

      test('a new mutable set is returned', () => {
        assert.isTrue(isThawed(set0));
        assert.isTrue(isThawed(set1));
        assert.notStrictEqual(set0, set1);
        assert.notStrictEqual(extractMap(set0), extractMap(set1));
      });

      test('the new set has the same size as the input set', () => {
        assert.strictEqual(size(set1), size(set0));
      });

      test('the new set has all of the items in the input set', () => {
        assert.deepEqual(Array.from(set0), Array.from(set1));
      });

      test('changes made to the new set do not affect the input set', () => {
        remove('A', set1);
        add('E', set1);
        assert.deepEqual(Array.from(set0), ['A', 'B', 'C']);
        assert.deepEqual(Array.from(set1), ['B', 'C', 'E']);
      });
    });
  });
});