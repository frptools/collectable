import {assert} from 'chai';
import {size, empty, isFrozen, has, set, updateTree, update, thaw, values, fromPairs} from '../../src';
import {RedBlackTreeImpl} from '../../src/internals';
import {createTree, sortedValues, arrayFrom} from '../test-utils';

var tree: RedBlackTreeImpl<any, any>,
    emptyTree: RedBlackTreeImpl<any, any>,
    mixedTree: RedBlackTreeImpl<number, any>;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = <RedBlackTreeImpl<any, any>>empty();
    tree = createTree();
    mixedTree = <RedBlackTreeImpl<number, any>>fromPairs<number, any>([[2, 'X'], [4, {foo: 'bar'}], [6, 123]]);
  });

  suite('updateTree()', () => {
    test('returns the same tree if no changes are made', () => {
      const tree1 = updateTree(tree => {}, tree);
      assert.strictEqual(tree1, tree);
    });

    test('treats the inner tree as mutable', () => {
      const tree1 = updateTree(tree => {
        assert.isFalse(isFrozen(tree));
        set(1, '#1', tree);
      }, tree);
      assert.isTrue(isFrozen(tree1));
      assert.deepEqual(Array.from(values(tree1)), [1].concat(sortedValues).map(n => `#${n}`));
    });
  });

  suite('update()', () => {
    test('returns the same tree if no changes are made to the specified value', () => {
      assert.strictEqual(update(c => 'X', 2, mixedTree), mixedTree);
      assert.strictEqual(update(o => o, 4, mixedTree), mixedTree);
      assert.strictEqual(update(n => 123, 6, mixedTree), mixedTree);
    });

    test('if the returned value is not undefined and the key was previously absent from the tree, the new key and value is inserted', () => {
      const tree0 = update(v => {
        assert.isUndefined(v);
        return `#1`;
      }, 1, tree);
      assert.isTrue(has(1, tree0));
      assert.strictEqual(size(tree0), size(tree) + 1);
    });

    test('if the returned value is undefined and the key was previously in the tree, it is removed from the tree', () => {
      const tree0 = update(v => {
        assert.isDefined(v);
        return void 0;
      }, sortedValues[1], tree);
      assert.isFalse(has(sortedValues[1], tree0));
      assert.strictEqual(size(tree0), size(tree) - 1);
    });

    test('returns a new tree if the new value is different to the existing value', () => {
      const tree1 = update(c => 'K', 2, mixedTree);
      const tree2 = update(o => ({foo: 'baz'}), 4, mixedTree);
      const tree3 = update(n => 42, 6, mixedTree);
      assert.notStrictEqual(mixedTree, tree1);
      assert.notStrictEqual(mixedTree, tree2);
      assert.notStrictEqual(mixedTree, tree3);
      assert.deepEqual(arrayFrom(tree1), [[2, 'K'], [4, {foo: 'bar'}], [6, 123]]);
      assert.deepEqual(arrayFrom(tree2), [[2, 'X'], [4, {foo: 'baz'}], [6, 123]]);
      assert.deepEqual(arrayFrom(tree3), [[2, 'X'], [4, {foo: 'bar'}], [6, 42]]);
    });

    test('returns the same tree, modified with the updated value, if the tree was not currently frozen', () => {
      const tree0 = thaw(mixedTree);
      const tree1 = update(c => 'K', 2, tree0);
      const tree2 = update(o => ({foo: 'baz'}), 4, tree0);
      const tree3 = update(n => 42, 6, tree0);
      assert.strictEqual(tree0, tree1);
      assert.strictEqual(tree0, tree2);
      assert.strictEqual(tree0, tree3);
      assert.deepEqual(arrayFrom(tree0), [[2, 'K'], [4, {foo: 'baz'}], [6, 42]]);
    });
  });
});