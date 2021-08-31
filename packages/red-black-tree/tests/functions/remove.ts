import test from 'ava';
import { emptyWithNumericKeys, fromNumericKeys, get, remove, set, size } from '../../src';
import { Node, RedBlackTreeStructure, isNone } from '../../src/internals';
import { createTree, getKeys, unsortedValues, verifyBlackHeightInvariant, verifyRedBlackAdjacencyInvariant } from '../test-utils';

test('should return the same tree if the key was not found', t => {
  var tree = createTree();
  var tree2 = remove(-1, tree);
  t.is(tree, tree2);
});

test('should not find the removed key after it is removed', t => {
  var tree = createTree();
  for(var i = 0; i < unsortedValues.length; i++) {
    t.not(get(unsortedValues[i], tree), `The key "${unsortedValues[i]}" is unexpectedly missing prior to removal`, void 0);
    tree = <RedBlackTreeStructure<number, string>>remove(unsortedValues[i], tree);
    t.is(get(unsortedValues[i], tree), void 0, `The key "${unsortedValues[i]}" was not removed`);
  }
});

test('should reduce the size of the tree by one if the key was found', t => {
  var tree0 = createTree();
  for(var i = 0, count = unsortedValues.length; i < unsortedValues.length; i++) {
    tree0 = <RedBlackTreeStructure<number, string>>remove(unsortedValues[i], tree0);
    t.is(tree0._size, --count, `The tree size was not decremented after the "${unsortedValues[i]}" was removed`);
  }
});

test(`should reset the size back to 0 after the last key is removed`, t => {
  var tree1 = fromNumericKeys([3, 7]);
  t.is(size(tree1), 2);
  tree1 = remove(3, tree1);
  t.is(size(tree1), 1);
  tree1 = remove(7, tree1);
  t.is(size(tree1), 0);
});

test('should successfully remove a left-hanging node from a two-node tree', t => {
  const tree = set(2, null, set(4, null, emptyWithNumericKeys<number>()));
  t.is(tree._root.key, 4);
  t.is(tree._root._left.key, 2);

  const tree2 = remove(2, tree);
  t.is(tree2._size, 1);
  t.is(tree2._root.key, 4);
  t.true(isNone(tree2._root._left));
  t.true(isNone(tree2._root._right));
});

test('should successfully remove a right-hanging node from a two-node tree', t => {
  const tree = set(4, null, set(2, null, emptyWithNumericKeys<number>()));
  t.is(tree._root.key, 2);
  t.is(tree._root._right.key, 4);

  const tree2 = remove(4, tree);
  t.is(tree2._size, 1);
  t.is(tree2._root.key, 2);
  t.true(isNone(tree2._root._left));
  t.true(isNone(tree2._root._right));
});

test('should successfully remove the root from a two-node tree with a left-hanging node', t => {
  const tree = set(2, null, set(4, null, emptyWithNumericKeys<number>()));
  t.is(tree._root.key, 4);
  t.is(tree._root._left.key, 2);

  const tree2 = remove(4, tree);
  t.is(tree2._size, 1);
  t.is(tree2._root.key, 2);
  t.true(isNone(tree2._root._left));
  t.true(isNone(tree2._root._right));
});

test('should successfully remove the root from a two-node tree with a right-hanging node', t => {
  const tree = set(4, null, set(2, null, emptyWithNumericKeys<number>()));
  t.is(tree._root.key, 2);
  t.is(tree._root._right.key, 4);

  const tree2 = remove(2, tree);
  t.is(tree2._size, 1);
  t.is(tree2._root.key, 4);
  t.true(isNone(tree2._root._left));
  t.true(isNone(tree2._root._right));
});

test('should successfully remove the root from a balanced three-node tree', t => {
  const tree = remove(2, set(2, 'two', set(3, 'three', set(1, 'one', emptyWithNumericKeys<string>()))));
  t.is(get(3, tree), 'three');
});

test('should preserve the order of the rest of the tree after a key is removed', t => {
  var tree = createTree();
  for(var i = 0; i < unsortedValues.length; i++) {
    tree = <RedBlackTreeStructure<number, string>>remove(unsortedValues[i], tree);
    var values = getKeys(tree._root);
    var sorted = values.slice().sort((a, b) => a - b);
    t.deepEqual(values, sorted, `The order of keys in the tree is incorrect after removing key "${unsortedValues[i]}"`);
  }
});

test('should preserve the invariants required for red-black trees', t => {
  var tree = createTree();
  for(var i = 0; i < unsortedValues.length; i++) {
    tree = <RedBlackTreeStructure<number, string>>remove(unsortedValues[i], tree);
    verifyRedBlackAdjacencyInvariant(tree, t);
    verifyBlackHeightInvariant(tree, t);
  }
});

test('should maintain the correct subtree count at each updated node', t => {
  var tree = createTree();

  for(var i = 0; i < unsortedValues.length; i++) {
    tree = <RedBlackTreeStructure<number, string>>remove(unsortedValues[i], tree);
    t.is(tree._root._count, tree._size, `root count: ${tree._root._count} is incorrect for tree size ${tree}`);
    walk(tree._root);
  }

  function walk (node: Node<any, any>): void {
    const msg = `node count: ${node._count} is incorrect for node #${node.key} at tree size ${tree} (count left: ${node._left._count}, right: ${node._right._count})`;
    const expectedCount = isNone(node) ? 0 : node._left._count + node._right._count + 1;
    t.is(node._count, expectedCount, msg);
    if(!isNone(node._left)) walk(node._left);
    if(!isNone(node._right)) walk(node._right);
  }
});

test("should not have a red node with a red child", t => {
  var tree = emptyWithNumericKeys<number>(true);
  set(1, 10, tree);
  set(2, 11, tree);
  remove(1, tree);
  set(3, 12, tree);
  set(0, 13, tree);
  set(1, 14, tree);
  remove(1, tree);
  remove(2, tree);
  remove(0, tree);
  set(4, 15, tree);
  set(0, 16, tree); // SET key 0 to 16
  t.is(get(0, tree), 16, "Get of key 0 should return 16")
})
