import {assert} from 'chai';
import {isMutable, isImmutable, modify, unwrap} from '@collectable/core';
import {RedBlackTreeStructure, fromPairsWithStringKeys, set, remove, size, clone} from '../../src';

suite('[RedBlackTree]', () => {
  suite('clone()', () => {
    suite('when the input set is immutable', () => {
      let tree0: RedBlackTreeStructure<string, string>, tree1: RedBlackTreeStructure<string, string>;
      setup(() => {
        tree0 = fromPairsWithStringKeys([['A', 'a'], ['B', 'b'], ['C', 'c']]);
        tree1 = clone(tree0);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(tree0, tree1);
        assert.isTrue(isImmutable(tree1));
      });

      test('the new set has the same size as the input set', () => {
        assert.strictEqual(size(tree1), size(tree0));
      });

      test('the new set has all of the items in the input set', () => {
        assert.deepEqual(unwrap(tree0), unwrap(tree1));
      });

      test('changes made to the new set do not affect the input set', () => {
        const tree2 = set('E', 'e', remove('A', tree1));
        assert.deepEqual(unwrap(tree1), {'A': 'a', 'B': 'b', 'C': 'c'});
        assert.deepEqual(unwrap(tree2), {'B': 'b', 'C': 'c', 'E': 'e'});
      });
    });

    suite('when the input set is mutable', () => {
      let tree0: RedBlackTreeStructure<string, string>, tree1: RedBlackTreeStructure<string, string>;
      setup(() => {
        tree0 = modify(fromPairsWithStringKeys([['A', 'a'], ['B', 'b'], ['C', 'c']]));
        tree1 = clone(tree0);
      });

      test('a new mutable set is returned', () => {
        assert.isTrue(isMutable(tree0));
        assert.isTrue(isMutable(tree1));
        assert.notStrictEqual(tree0, tree1);
      });

      test('the new set has the same size as the input set', () => {
        assert.strictEqual(size(tree1), size(tree0));
      });

      test('the new set has all of the items in the input set', () => {
        assert.deepEqual(unwrap(tree0), unwrap(tree1));
      });

      test('changes made to the new set do not affect the input set', () => {
        remove('A', tree1);
        set('E', 'e', tree1);
        assert.deepEqual(unwrap(tree0), {'A': 'a', 'B': 'b', 'C': 'c'});
        assert.deepEqual(unwrap(tree1), {'B': 'b', 'C': 'c', 'E': 'e'});
      });
    });
  });
});