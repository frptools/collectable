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

    test('should return the original if a replacement value is unchanged', () => {
      var tree = createTree();
      var tree1 = set(sortedValues[2], `#${sortedValues[2]}`, tree);
      assert.strictEqual(tree, tree1);
    });

    test('should replace an existing value if it has changed', () => {
      var tree = createTree();
      var expectedValues1 = sortedValues.map(n => `#${n}`);
      expectedValues1[0] = '#foo';
      var expectedValues2 = expectedValues1.slice();
      expectedValues2[10] = '#bar';
      var tree1 = set(sortedValues[0], expectedValues1[0], tree);
      var tree2 = set(sortedValues[10], expectedValues2[10], tree1);
      var values = getValues(tree._root);
      var values1 = getValues(tree1._root);
      var values2 = getValues(tree2._root);
      assert.notStrictEqual(tree, tree1);
      assert.notStrictEqual(tree, tree2);
      assert.notStrictEqual(tree1, tree2);
      assert.deepEqual(values, sortedValues.map(v => `#${v}`));
      assert.deepEqual(values1, expectedValues1);
      assert.deepEqual(values2, expectedValues2);
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