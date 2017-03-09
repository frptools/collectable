import {assert} from 'chai';
import {freeze, thaw, set, isFrozen, values} from '../../src';
import {RedBlackTreeImpl} from '../../src/internals';
import {empty, createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeImpl<any, any>, emptyTree;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('freeze()', () => {
    test('should return the same tree if already frozen', () => {
      assert.strictEqual(freeze(tree), tree);
    });

    test('should return a new tree if not frozen', () => {
      var tree0 = thaw(tree);
      assert.notStrictEqual(freeze(tree0), tree0);
    });

    test('should cause common operations to avoid mutating the input tree', () => {
      const values1 = sortedValues.concat(9450).sort((a, b) => a - b).map(n => `#${n}`);
      const values2 = sortedValues.concat(572).sort((a, b) => a - b).map(n => `#${n}`);
      const values3 = sortedValues.concat([9450, 1]).sort((a, b) => a - b).map(n => `#${n}`);
      const tree0 = freeze(thaw(tree));
      const tree1 = set(9450, '#9450', tree0);
      const tree2 = set(572, '#572', tree0);
      const tree3 = set(1, '#1', tree1);
      assert.notStrictEqual(tree, tree0);
      assert.notStrictEqual(tree1, tree0);
      assert.notStrictEqual(tree2, tree0);
      assert.notStrictEqual(tree3, tree1);
      assert.deepEqual(values(tree0), sortedValues.map(n => `#${n}`));
      assert.deepEqual(values(tree1), values1);
      assert.deepEqual(values(tree2), values2);
      assert.deepEqual(values(tree3), values3);
    });
  });

  suite('thaw()', () => {
    test('should return the same tree if already unfrozen', () => {
      const tree0 = thaw(tree);
      assert.strictEqual(thaw(tree0), tree0);
    });

    test('should return a new tree if frozen', () => {
      assert.notStrictEqual(thaw(tree), tree);
    });

    test('should cause common operations to directly mutate the input tree', () => {
      const tree0 = thaw(tree);
      const tree1 = set(9450, '#9450', tree0);
      const tree2 = set(572, '#572', tree0);
      const tree3 = set(1, '#1', tree1);
      assert.strictEqual(tree0, tree1);
      assert.strictEqual(tree0, tree2);
      assert.strictEqual(tree0, tree3);
      assert.deepEqual(values(tree0), sortedValues.concat([1, 572, 9450]).sort((a, b) => a - b).map(n => `#${n}`));
    });
  });

  suite('isFrozen()', () => {
    test('should return true if the tree is frozen', () => {
      assert.isTrue(isFrozen(tree));
      assert.isTrue(isFrozen(freeze(thaw(tree))));
    });

    test('should return false if the tree is unfrozen', () => {
      const tree0 = thaw(tree);
      assert.isFalse(isFrozen(tree0));
      assert.isFalse(isFrozen(thaw(freeze(tree0))));
    });
  });
});