import {assert} from 'chai';
import {empty as emptyTree, set} from '../src';
import {RedBlackTree, Node, isNone} from '../src/internals';

export function empty(): RedBlackTree<number, number> {
  return emptyTree<number, number>();
}

export const NONE = [['black', void 0]];

export function represent<K, V>(treeOrNode: RedBlackTree<K, V>|Node<K, any>, set?: Set<Node<K, V>>): any[] {
  var node = treeOrNode instanceof RedBlackTree ? treeOrNode._root : treeOrNode;
  if(!node || isNone(node)) return NONE;
  var value = [node.red ? 'red' : 'black', node.key];
  if(!set) set = new Set();
  if(set.has(node)) return [value];
  set.add(node);
  return isNone(node.left) ? isNone(node.right) ? [value]
                                                : [value, represent(node.right, set)]
                           : isNone(node.right) ? [represent(node.left, set), value]
                                                : [represent(node.left, set), value, represent(node.right, set)];
}

export function getValues(node: Node<number, string>, array: string[] = []): string[] {
  if(!isNone(node.left)) getValues(node.left, array);
  array.push(node.value);
  if(!isNone(node.right)) getValues(node.right, array);
  return array;
}

export function getKeys(node: Node<number, string>, array: number[] = []): number[] {
  if(!isNone(node.left)) {
    getKeys(node.left, array);
  }
  array.push(node.key);
  if(!isNone(node.right)) {
    getKeys(node.right, array);
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


export const sortedValues = [6, 69, 85, 188, 229, 307, 344, 353, 415, 442, 450, 452, 462, 471, 517, 539, 571, 662, 666,
  672, 706, 778, 897, 948, 954, 958, 1015, 1112, 1137, 1207, 1228, 1323, 1333, 1363, 1387, 1476, 1485, 1501, 1564,
  1570, 1571, 1658, 1691, 1788, 1832, 1975, 1991, 2021, 2062, 2077, 2174, 2298, 2480, 2533, 2551, 2652, 2701, 2713,
  2715, 2724, 2758, 2829, 2837, 2863, 2894, 2984, 2999, 3042, 3233, 3253, 3275, 3276, 3310, 3350, 3389, 3391, 3401,
  3437, 3469, 3488, 3536, 3550, 3555, 3572, 3609, 3646, 3670, 3673, 3736, 3747, 3755, 3761, 3778, 3794, 3821, 3834,
  3861, 3890, 3976, 3999, 4040, 4041, 4048, 4163, 4208, 4232, 4235, 4249, 4348, 4419, 4495, 4517, 4573, 4594, 4646,
  4664, 4669, 4674, 4734, 4740, 4753, 4807, 4847, 4869, 4933, 4990, 5049, 5113, 5135, 5143, 5173, 5217, 5478, 5517,
  5525, 5589, 5648, 5679, 5777, 5791, 5797, 5834, 5836, 5851, 5886, 5891, 6027, 6125, 6190, 6287, 6301, 6324, 6519,
  6520, 6531, 6542, 6570, 6589, 6643, 6673, 6705, 6722, 6831, 6864, 6886, 6966, 7111, 7125, 7155, 7206, 7232, 7315,
  7383, 7452, 7495, 7568, 7611, 7630, 7666, 7670, 7673, 7679, 7691, 7725, 7748, 7807, 7810, 7823, 7866, 7991, 8033,
  8034, 8058, 8060, 8161, 8169, 8176, 8182, 8272, 8323, 8343, 8427, 8501, 8512, 8586, 8590, 8591, 8632, 8691, 8730,
  8780, 8870, 8875, 8894, 8931, 8953, 8988, 9010, 9054, 9093, 9128, 9219, 9221, 9226, 9273, 9289, 9328, 9354, 9384,
  9411, 9491, 9507, 9508, 9532, 9551, 9599, 9605, 9691, 9771, 9861, 9938, 9939];

export function createTree() {
  var tree = emptyTree<number, string>();
  unsortedValues.forEach(n => {
    tree = set(n, `#${n}`, tree);
  });
  return tree;
}

export function verifyRedBlackAdjacencyInvariant<K, V>(tree: RedBlackTree<K, V>): void {
  function descend(node: Node<K, V>, previousWasRed: boolean): void {
    assert.isFalse(node.red && previousWasRed, 'Adjacent red nodes found, violating red-black tree invariant');
    if(!isNone(node.left)) descend(node.left, node.red);
    if(!isNone(node.right)) descend(node.right, node.red);
  }
  descend(tree._root, false);
}

export function verifyBlackHeightInvariant<K, V>(tree: RedBlackTree<K, V>): void {
  var measuring = true, depth = 0;
  function descend(node: Node<K, V>, count: number): void {
    if(isNone(node.left)) {
      if(measuring) {
        depth = count;
        measuring = false;
      }
      else {
        assert.strictEqual(count, depth, 'Inconsistent black height found, violating red-black tree invariant');
      }
    }
    else {
      descend(node.left, count + (node.left.red ? 0 : 1));
    }
    if(isNone(node.right)) {
      if(measuring) {
        depth = count;
        measuring = false;
      }
      else {
        assert.strictEqual(count, depth, 'Inconsistent black height found, violating red-black tree invariant');
      }
    }
    else {
      descend(node.right, count + (node.right.red ? 0 : 1));
    }
  }
  descend(tree._root, 1);
}