import {assert} from 'chai';
import {modify, isMutable, isImmutable} from '@collectable/core';
import {HashSetStructure, add, has, size, fromArray} from '../../src';

suite('[HashSet]', () => {
  suite('add()', () => {
    suite('when the item already exists in the set', () => {
      let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
      setup(() => {
        set0 = fromArray(['A', 'B', 'C']);
        set1 = add('B', set0);
      });

      test('the set size does not change', () => {
        assert.strictEqual(size(set0), 3);
        assert.strictEqual(size(set1), 3);
      });

      test('the input set is returned', () => {
        assert.strictEqual(set0, set1);
      });

      test('the specified item can still be retrieved from the set', () => {
        assert.isTrue(has('B', set1));
      });
    });

    suite('when the item does not exist in the set', () => {
      let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
      suite('if the input set is mutable', () => {
        suiteSetup(() => {
          set0 = modify(fromArray(['A', 'B', 'C']));
          set1 = add('D', set0);
        });

        test('the input set is returned', () => {
          assert.strictEqual(set0, set1);
        });

        test('the input set is still mutable', () => {
          assert.isTrue(isMutable(set1));
        });

        test('the set size is incremented', () => {
          assert.strictEqual(size(set1), 4);
        });

        test('the added item can be retrieved from the set', () => {
          assert.isTrue(has('D', set1));
        });

        test('the set has all of the items it had before the new item was added', () => {
          for(let c of Array.from(set0)) {
            assert.isTrue(has(c, set1));
          }
        });
      });

      suite('if the input set is immutable', () => {
        suiteSetup(() => {
          set0 = fromArray(['A', 'B', 'C']);
          set1 = add('D', set0);
        });

        test('the input set is not modified', () => {
          assert.sameMembers(Array.from(set0), ['A', 'B', 'C']);
          assert.strictEqual(size(set0), 3);
          assert.isTrue(isImmutable(set0));
        });

        test('a new immutable set is returned', () => {
          assert.isTrue(isImmutable(set1));
        });

        test('the size of the new set is one greater than that of the input set', () => {
          assert.strictEqual(size(set1), 4);
        });

        test('the new set has all of the items in the input set', () => {
          for(let c of Array.from(set0)) {
            assert.isTrue(has(c, set1));
          }
        });

        test('the added item can be retrieved from the new set', () => {
          assert.isTrue(has('D', set1));
        });

        test('all expected members exist in the new set in the correct order', () => {
          assert.sameMembers(Array.from(set1), ['A', 'B', 'C', 'D']);
        });
      });
    });
  });
});