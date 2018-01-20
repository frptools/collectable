import test from 'ava';
import { set } from '../../src';
import { Node, RedBlackTreeStructure, isNone } from '../../src/internals';
import { createTree, empty, getValues, represent, sortedValues, unsortedValues, verifyBlackHeightInvariant, verifyRedBlackAdjacencyInvariant } from '../test-utils';

test('should replace the root of an empty list', t => {
  const tree = <RedBlackTreeStructure<any, any>>set(1, 1, empty());
  t.is(tree._size, 1);
  t.is(tree._root.value, 1);
});

test('should add the second entry as a child of the root', t => {
  const tree0 = <RedBlackTreeStructure<any, any>>set(1, 1, empty());
  const tree1 = <RedBlackTreeStructure<any, any>>set(2, 2, tree0);
  t.not(tree0, tree1);
  t.not(tree0._root, tree1._root);
  t.deepEqual(represent(tree0), [['black', 1]]);
  t.deepEqual(represent(tree1), [['black', 1], [['red', 2]]]);
});

test('should insert successive values in the correct sort order', t => {
  var tree = <RedBlackTreeStructure<any, any>>createTree();
  var values = getValues(tree._root);
  t.deepEqual(values, sortedValues.map(v => `#${v}`));
});

test('should return the original if a replacement value is unchanged', t => {
  var tree = createTree();
  var tree1 = set(sortedValues[2], `#${sortedValues[2]}`, tree);
  t.is(tree, tree1);
});

test('should replace an existing value if it has changed', t => {
  var tree = <RedBlackTreeStructure<any, any>>createTree();
  var expectedValues1 = sortedValues.map(n => `#${n}`);
  expectedValues1[0] = '#foo';
  var expectedValues2 = expectedValues1.slice();
  expectedValues2[10] = '#bar';
  var tree1 = <RedBlackTreeStructure<any, any>>set(sortedValues[0], expectedValues1[0], tree);
  var tree2 = <RedBlackTreeStructure<any, any>>set(sortedValues[10], expectedValues2[10], tree1);
  var values = getValues(tree._root);
  var values1 = getValues(tree1._root);
  var values2 = getValues(tree2._root);
  t.not(tree, tree1);
  t.not(tree, tree2);
  t.not(tree1, tree2);
  t.deepEqual(values, sortedValues.map(v => `#${v}`));
  t.deepEqual(values1, expectedValues1);
  t.deepEqual(values2, expectedValues2);
});

test('should preserve the red-black adjacency invariant required for red-black trees', t => {
  var tree = createTree();
  verifyRedBlackAdjacencyInvariant(tree, t);
});

test('should preserve the black height invariant required for red-black trees', t => {
  var tree = createTree();
  verifyBlackHeightInvariant(tree, t);
});

test('should maintain the correct subtree count at each updated node', t => {
  var tree = <RedBlackTreeStructure<any, any>>empty();

  for(var i = 0; i < unsortedValues.length; i++) {
    tree = <RedBlackTreeStructure<any, any>>set(unsortedValues[i], unsortedValues[i], tree);
    t.is(tree._root._count, tree._size, `root count: ${tree._root._count} is incorrect for tree size ${tree._size}`);
    walk(tree._root);
  }

  function walk (node: Node<any, any>): void {
    const msg = `node count: ${node._count} is incorrect for node #${node.key} at tree size ${tree._size} (count left: ${node._left._count}, right: ${node._right._count})`;
    t.is(node._count, node._left._count + node._right._count + 1, msg);
    if(!isNone(node._left)) walk(node._left);
    if(!isNone(node._right)) walk(node._right);
  }
});
