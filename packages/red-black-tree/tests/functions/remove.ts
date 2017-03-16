import {assert} from 'chai';
import {remove, get} from '../../src';
import {RedBlackTreeImpl, Node, isNone} from '../../src/internals';
import {createTree, getKeys, unsortedValues, verifyRedBlackAdjacencyInvariant, verifyBlackHeightInvariant} from '../test-utils';

suite('[RedBlackTree]', () => {
  suite('remove()', () => {
    test('should return the same tree if the key was not found', () => {
      var tree = createTree();
      var tree2 = remove(-1, tree);
      assert.strictEqual(tree, tree2);
    });

    test('should not find the removed key after it is removed', () => {
      var tree = createTree();
      for(var i = 0; i < unsortedValues.length; i++) {
        assert.isDefined(get(unsortedValues[i], tree), `The key "${unsortedValues[i]}" is unexpectedly missing prior to removal`);
        tree = <RedBlackTreeImpl<number, string>>remove(unsortedValues[i], tree);
        assert.isUndefined(get(unsortedValues[i], tree), `The key "${unsortedValues[i]}" was not removed`);
      }
    });

    test('should reduce the size of the tree by one if the key was found', () => {
      var tree = createTree();
      for(var i = 0, count = unsortedValues.length; i < unsortedValues.length; i++) {
        tree = <RedBlackTreeImpl<number, string>>remove(unsortedValues[i], tree);
        assert.strictEqual(tree._size, --count, `The tree size was not decremented after the "${unsortedValues[i]}" was removed`);
      }
    });

    test('should preserve the order of the rest of the tree after a key is removed', () => {
      var tree = createTree();
      for(var i = 0; i < unsortedValues.length; i++) {
        tree = <RedBlackTreeImpl<number, string>>remove(unsortedValues[i], tree);
        var values = getKeys(tree._root);
        var sorted = values.slice().sort((a, b) => a - b);
        assert.deepEqual(values, sorted, `The order of keys in the tree is incorrect after removing key "${unsortedValues[i]}"`);
      }
    });

    test('should preserve the red-black adjacency invariant required for red-black trees', () => {
      var tree = createTree();
      verifyRedBlackAdjacencyInvariant(tree);
    });

    test('should preserve the black height invariant required for red-black trees', () => {
      var tree = createTree();
      verifyBlackHeightInvariant(tree);
    });

    test('should maintain the correct subtree count at each updated node', () => {
      var tree = createTree();

      for(var i = 0; i < unsortedValues.length; i++) {
        tree = <RedBlackTreeImpl<number, string>>remove(unsortedValues[i], tree);
        assert.strictEqual(tree._root._count, tree._size, `root count: ${tree._root._count} is incorrect for tree size ${tree}`);
        walk(tree._root);
      }

      function walk(node: Node<any, any>): void {
        const msg = `node count: ${node._count} is incorrect for node #${node.key} at tree size ${tree} (count left: ${node._left._count}, right: ${node._right._count})`;
        const expectedCount = isNone(node) ? 0 : node._left._count + node._right._count + 1;
        assert.strictEqual(node._count, expectedCount, msg);
        if(!isNone(node._left)) walk(node._left);
        if(!isNone(node._right)) walk(node._right);
      }
    });
  });
});