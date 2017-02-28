import {assert} from 'chai';
import {set} from '../../src';
import {empty, represent, sortedValues, getValues, createTree, verifyRedBlackAdjacencyInvariant, verifyBlackHeightInvariant} from '../test-utils';

suite('[RedBlackTree]', () => {
  suite('set()', () => {
    test('should replace the root of an empty list', () => {
      const tree = set(1, 1, empty());
      assert.strictEqual(tree._size, 1);
      assert.strictEqual(tree._root.value, 1);
    });

    test('should add the second entry as a child of the root', () => {
      const tree0 = set(1, 1, empty());
      const tree1 = set(2, 2, tree0);
      assert.notStrictEqual(tree0, tree1);
      assert.notStrictEqual(tree0._root, tree1._root);
      assert.deepEqual(represent(tree0), [['black', 1]]);
      assert.deepEqual(represent(tree1), [['black', 1], [['red', 2]]]);
    });

    test('should insert successive values in the correct sort order', () => {
      var tree = createTree();
      var values = getValues(tree._root);
      assert.deepEqual(values, sortedValues.map(v => `#${v}`));
    });

    test('should preserve the red-black adjacency invariant required for red-black trees', () => {
      var tree = createTree();
      verifyRedBlackAdjacencyInvariant(tree);
    });

    test('should preserve the black height invariant required for red-black trees', () => {
      var tree = createTree();
      verifyBlackHeightInvariant(tree);
    });
  });
});