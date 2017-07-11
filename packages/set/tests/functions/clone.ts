import {assert} from 'chai';
import {modify, isMutable, isImmutable} from '@collectable/core';
import {HashSetStructure, fromArray, add, remove, size, clone} from '../../src';
import {extractMap} from '../../src/internals';

suite('[HashSet]', () => {
  suite('clone()', () => {
    suite('when the input set is immutable', () => {
      let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
      setup(() => {
        set0 = fromArray(['A', 'B', 'C']);
        set1 = clone(set0);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(set0, set1);
        assert.isTrue(isImmutable(set1));
      });

      test('the new set has the same size as the input set', () => {
        assert.strictEqual(size(set1), size(set0));
      });

      test('the new set has all of the items in the input set', () => {
        assert.sameMembers(Array.from(set0), Array.from(set1));
      });

      test('changes made to the new set do not affect the input set', () => {
        const set2 = add('E', remove('A', set1));
        assert.sameMembers(Array.from(set1), ['A', 'B', 'C']);
        assert.sameMembers(Array.from(set2), ['B', 'C', 'E']);
      });
    });

    suite('when the input set is mutable', () => {
      let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
      setup(() => {
        set0 = modify(fromArray(['A', 'B', 'C']));
        set1 = clone(set0);
      });

      test('a new mutable set is returned', () => {
        assert.isTrue(isMutable(set0));
        assert.isTrue(isMutable(set1));
        assert.notStrictEqual(set0, set1);
        assert.notStrictEqual(extractMap(set0), extractMap(set1));
      });

      test('the new set has the same size as the input set', () => {
        assert.strictEqual(size(set1), size(set0));
      });

      test('the new set has all of the items in the input set', () => {
        assert.sameMembers(Array.from(set0), Array.from(set1));
      });

      test('changes made to the new set do not affect the input set', () => {
        remove('A', set1);
        add('E', set1);
        assert.sameMembers(Array.from(set0), ['A', 'B', 'C']);
        assert.sameMembers(Array.from(set1), ['B', 'C', 'E']);
      });
    });
  });
});