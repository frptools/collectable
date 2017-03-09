import {assert} from 'chai';
import {RedBlackTreeEntry, empty, first, firstKey, firstValue, iterateFromFirst} from '../../src';
import {RedBlackTreeImpl} from '../../src/internals';
import {createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeImpl<any, any>, emptyTree;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('first()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(first(emptyTree));
    });

    test('returns a pointer to the first node', () => {
      const node = <RedBlackTreeEntry<any, any>>first(tree);
      assert.isDefined(node);
      assert.strictEqual(node.key, sortedValues[0]);
    });
  });

  suite('firstKey()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(firstKey(emptyTree));
    });

    test('returns the leftmost key', () => {
      const key = firstKey(tree);
      assert.strictEqual(key, sortedValues[0]);
    });
  });

  suite('firstValue()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(firstValue(emptyTree));
    });

    test('returns the leftmost value', () => {
      const value = firstValue(tree);
      assert.strictEqual(value, `#${sortedValues[0]}`);
    });
  });

  suite('iterateFromFirst()', () => {
    test('returns a reverse iterator starting from the leftmost node', () => {
      const it = iterateFromFirst(tree);
      assert.deepEqual(Array.from(it).map(n => n.key), sortedValues);
    });

    test('the iterator should be in a completed state if the tree is empty', () => {
      const it = iterateFromFirst(emptyTree);
      assert.isTrue(it.next().done);
    });
  });
});