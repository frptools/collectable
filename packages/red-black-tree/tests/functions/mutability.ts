import {assert} from 'chai';
import {isImmutable, modify, commit} from '@collectable/core';
import {set, values} from '../../src';
import {RedBlackTreeStructure} from '../../src/internals';
import {empty, createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('commit()', () => {
    test('should return the input tree', () => {
      assert.strictEqual(commit(tree), tree);
    });

    test('should freeze the tree if not frozen', () => {
      var tree0 = modify(tree);
      assert.isTrue(isImmutable(commit(tree0)));
    });

    test('should cause common operations to avoid mutating the input tree', () => {
      const values1 = sortedValues.concat(9450).sort((a, b) => a - b).map(n => `#${n}`);
      const values2 = sortedValues.concat(572).sort((a, b) => a - b).map(n => `#${n}`);
      const values3 = sortedValues.concat([9450, 1]).sort((a, b) => a - b).map(n => `#${n}`);
      const tree0 = commit(modify(tree));
      const tree1 = set(9450, '#9450', tree0);
      const tree2 = set(572, '#572', tree0);
      const tree3 = set(1, '#1', tree1);
      assert.notStrictEqual(tree, tree0);
      assert.notStrictEqual(tree1, tree0);
      assert.notStrictEqual(tree2, tree0);
      assert.notStrictEqual(tree3, tree1);
      assert.deepEqual(Array.from(values(tree0)), sortedValues.map(n => `#${n}`));
      assert.deepEqual(Array.from(values(tree1)), values1);
      assert.deepEqual(Array.from(values(tree2)), values2);
      assert.deepEqual(Array.from(values(tree3)), values3);
    });
  });

  suite('modify()', () => {
    test('should return the same tree if already unfrozen', () => {
      const tree0 = modify(tree);
      assert.strictEqual(modify(tree0), tree0);
    });

    test('should return a new tree if frozen', () => {
      assert.notStrictEqual(modify(tree), tree);
    });

    test('should cause common operations to directly mutate the input tree', () => {
      const tree0 = modify(tree);
      const tree1 = set(9450, '#9450', tree0);
      const tree2 = set(572, '#572', tree0);
      const tree3 = set(1, '#1', tree1);
      assert.strictEqual(tree0, tree1);
      assert.strictEqual(tree0, tree2);
      assert.strictEqual(tree0, tree3);
      assert.deepEqual(Array.from(values(tree0)), sortedValues.concat([1, 572, 9450]).sort((a, b) => a - b).map(n => `#${n}`));
    });
  });

  suite('isImmutable()', () => {
    test('should return true if the tree is frozen', () => {
      assert.isTrue(isImmutable(tree));
      assert.isTrue(isImmutable(commit(modify(tree))));
    });

    test('should return false if the tree is unfrozen', () => {
      const tree0 = modify(tree);
      assert.isFalse(isImmutable(tree0));
      assert.isFalse(isImmutable(modify(commit(tree0))));
    });
  });
});