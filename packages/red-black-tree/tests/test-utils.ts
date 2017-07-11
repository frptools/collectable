import {assert} from 'chai';
import {emptyWithNumericKeys as emptyTree, set, arrayFrom as arrayFromTree} from '../src';
import {RedBlackTreeStructure, RedBlackTreeEntry, Node, isNone} from '../src/internals';

export function empty(): RedBlackTreeStructure<number, number> {
  return <RedBlackTreeStructure<number, number>>emptyTree<number>();
}

export function toPair<K, V>(entry: RedBlackTreeEntry<K, V>): [K, V] {
  return [entry.key, entry.value];
}

export function arrayFrom<K, V>(tree: RedBlackTreeStructure<K, V>): [K, V][] {
  return arrayFromTree(tree).map(toPair);
}

export const NONE = [['black', void 0]];

export function represent<K, V>(treeOrNode: RedBlackTreeStructure<K, V>|Node<K, any>, set?: Set<Node<K, V>>): any[] {
  var node = treeOrNode instanceof RedBlackTreeStructure ? treeOrNode._root : <Node<any, any>>treeOrNode;
  if(!node || isNone(node)) return NONE;
  var value = [node._red ? 'red' : 'black', node.key];
  if(!set) set = new Set();
  if(set.has(node)) return [value];
  set.add(node);
  return isNone(node._left) ? isNone(node._right) ? [value]
                                                : [value, represent(node._right, set)]
                           : isNone(node._right) ? [represent(node._left, set), value]
                                                : [represent(node._left, set), value, represent(node._right, set)];
}

export function getValues(node: Node<number, string>, array: string[] = []): string[] {
  if(!isNone(node._left)) {
    getValues(node._left, array);
  }
  array.push(node.value);
  if(!isNone(node._right)) {
    getValues(node._right, array);
  }
  return array;
}

export function getKeys(node: Node<number, string>, array: number[] = []): number[] {
  if(!isNone(node._left)) {
    getKeys(node._left, array);
  }
  array.push(node.key);
  if(!isNone(node._right)) {
    getKeys(node._right, array);
  }
  return array;
}

export const unsortedValues = [4740, 7125, 672, 6864, 7232, 8875, 7495, 8161, 706, 2533, 1570, 7568, 1658, 450, 3646,
  8034, 6831, 4674, 1228, 5217, 3609, 571, 5135, 4869, 3755, 2713, 3391, 6, 1485, 9219, 8730, 3536, 4517, 8427, 4495,
  662, 4847, 7866, 2077, 8586, 9128, 6287, 2999, 5173, 1363, 5836, 4990, 4419, 6125, 69, 4041, 9093, 9384, 6520, 2298,
  344, 7155, 778, 229, 3401, 517, 4669, 5113, 1691, 9551, 3437, 3275, 9289, 7670, 9532, 5648, 5797, 5517, 3488, 8343,
  8169, 415, 1564, 2984, 2062, 8060, 6886, 3761, 2701, 7673, 8894, 958, 8988, 954, 5049, 8058, 4040, 3276, 5679, 2021,
  7666, 9599, 4348, 1207, 8591, 2480, 7452, 4048, 3350, 6531, 9771, 7748, 7315, 471, 353, 8512, 8691, 7810, 7611, 4594,
  2551, 4933, 897, 4208, 9691, 1571, 3572, 5834, 6966, 7691, 188, 5525, 2829, 452, 2837, 9508, 6705, 3976, 6027, 9491,
  9010, 3736, 1112, 2863, 6673, 3999, 9411, 3469, 6542, 8632, 2652, 4646, 4734, 5143, 9605, 3555, 3778, 9938, 1788,
  1015, 7383, 6301, 3550, 9054, 1476, 4232, 5886, 4753, 1323, 3821, 2758, 3310, 7807, 7991, 6722, 6519, 3861, 539,
  5478, 8590, 1387, 4249, 3890, 2715, 85, 6190, 307, 8323, 6570, 8780, 1991, 666, 3670, 7111, 8870, 2724, 1501, 7725,
  4163, 6324, 3389, 3673, 4573, 3042, 8176, 6589, 5589, 9507, 3834, 8033, 9354, 5791, 2174, 1975, 9273, 7823, 1137,
  3233, 5851, 9226, 3747, 3794, 5777, 6643, 1832, 9328, 9939, 1333, 7206, 4235, 3253, 462, 8501, 8272, 4664, 8953, 442,
  8931, 7679, 9221, 2894, 948, 4807, 9861, 7630, 5891, 8182];

export const sortedValues = unsortedValues.slice().sort((a, b) => a - b);

export function createTree(): RedBlackTreeStructure<number, string> {
  var tree = emptyTree<string>();
  unsortedValues.forEach(n => {
    tree = set(n, `#${n}`, tree);
  });
  return <RedBlackTreeStructure<number, string>>tree;
}

export function verifyRedBlackAdjacencyInvariant<K, V>(tree: RedBlackTreeStructure<K, V>): void {
  function descend(node: Node<K, V>, previousWasRed: boolean): void {
    assert.isFalse(node._red && previousWasRed, 'Adjacent red nodes found, violating red-black tree invariant');
    if(!isNone(node._left)) descend(node._left, node._red);
    if(!isNone(node._right)) descend(node._right, node._red);
  }
  descend(tree._root, false);
}

export function verifyBlackHeightInvariant<K, V>(tree: RedBlackTreeStructure<K, V>): void {
  var measuring = true, depth = 0;
  function descend(node: Node<K, V>, count: number): void {
    if(isNone(node._left)) {
      if(measuring) {
        depth = count;
        measuring = false;
      }
      else {
        assert.strictEqual(count, depth, 'Inconsistent black height found, violating red-black tree invariant');
      }
    }
    else {
      descend(node._left, count + (node._left._red ? 0 : 1));
    }
    if(isNone(node._right)) {
      if(measuring) {
        depth = count;
        measuring = false;
      }
      else {
        assert.strictEqual(count, depth, 'Inconsistent black height found, violating red-black tree invariant');
      }
    }
    else {
      descend(node._right, count + (node._right._red ? 0 : 1));
    }
  }
  descend(tree._root, 1);
}