import test from 'ava';
import { RedBlackTreeEntry, find } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<number, string>;

test.beforeEach(() => {
  tree = createTree();
});

test('[gt] fails to find a match if the last key in the tree is less than or equal to the specified key', t => {
  const node = find('gt', sortedValues[sortedValues.length - 1], tree);
  t.is(node, void 0);
});

test('[gt] matches the leftmost node that has a key that is greater than the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    var expected = i === sortedValues.length - 1 ? void 0 : sortedValues[i + 1];
    var key = sortedValues[i];

    // #1: check keys known to exist in the tree
    var node = <RedBlackTreeEntry<any, any>>find('gt', key, tree);
    if(expected === void 0) {
      t.is(node, void 0);
    }
    else {
      t.not(node, void 0);
      t.is(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
    }

    // #2: check intermediate keys that do not exist in the tree
    key++;
    if(key !== expected) {
      node = <RedBlackTreeEntry<any, any>>find('gt', key, tree);
      if(expected === void 0) {
        t.is(node, void 0);
      }
      else {
        t.not(node, void 0);
        t.is(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
      }
    }
  }
});

test('[gte] fails to find a match if the last key in the tree is less than the specified key', t => {
  const node = find('gte', sortedValues[sortedValues.length - 1] + 1, tree);
  t.is(node, void 0);
});

test('[gte] matches the leftmost node that has a key that is greater than or equal to the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var node = <RedBlackTreeEntry<any, any>>find('gte', key, tree);
    t.not(node, void 0);
    t.is(node.key, key, `i: ${i}, key: ${key}, found: ${node.key}`);

    // #2: check intermediate keys that do not exist in the tree
    key++;
    var expected = i === sortedValues.length - 1 ? void 0 : sortedValues[i + 1];
    node = <RedBlackTreeEntry<any, any>>find('gte', key, tree);
    if(expected === void 0) {
      t.is(node, void 0);
    }
    else {
      t.not(node, void 0);
      t.is(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
    }
  }
});

test('[lt] fails to find a match if the first key in the tree is greater than or equal to the specified key', t => {
  const node = find('lt', sortedValues[0], tree);
  t.is(node, void 0);
});

test('[lt] matches the rightmost node that has a key that is less than the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    var expected = i === 0 ? void 0 : sortedValues[i - 1];
    var key = sortedValues[i];

    // #1: check keys known to exist in the tree
    var node = <RedBlackTreeEntry<any, any>>find('lt', key, tree);
    if(expected === void 0) {
      t.is(node, void 0);
    }
    else {
      t.not(node, void 0);
      t.is(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
    }

    // #2: check intermediate keys that do not exist in the tree
    key--;
    if(key !== expected) {
      node = <RedBlackTreeEntry<any, any>>find('lt', key, tree);
      if(expected === void 0) {
        t.is(node, void 0);
      }
      else {
        t.not(node, void 0);
        t.is(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
      }
    }
  }
});

test('[lte] fails to find a match if the first key in the tree is greater than the specified key', t => {
  const node = find('lte', sortedValues[0] - 1, tree);
  t.is(node, void 0);
});

test('[lte] matches the rightmost node that has a key that is less than or equal to the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var node = <RedBlackTreeEntry<any, any>>find('lte', key, tree);
    t.not(node, void 0);
    t.is(node.key, key, `i: ${i}, key: ${key}, found: ${node.key}`);

    // #2: check intermediate keys that do not exist in the tree
    key--;
    var expected = i === 0 ? void 0 : sortedValues[i - 1];
    node = <RedBlackTreeEntry<any, any>>find('lte', key, tree);
    if(expected === void 0) {
      t.is(node, void 0);
    }
    else {
      t.not(node, void 0);
      t.is(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
    }
  }
});
