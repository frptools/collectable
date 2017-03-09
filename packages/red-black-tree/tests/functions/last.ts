import {assert} from 'chai';
import {RedBlackTreeEntry, empty, last, lastKey, lastValue, iterateFromLast} from '../../src';
import {RedBlackTreeImpl} from '../../src/internals';
import {createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeImpl<any, any>, emptyTree;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('last()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(last(emptyTree));
    });

    test('returns a pointer to the last node', () => {
      const node = <RedBlackTreeEntry<any, any>>last(tree);
      assert.isDefined(node);
      assert.strictEqual(node.key, sortedValues[sortedValues.length - 1]);
    });
  });

  suite('lastKey()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(lastKey(emptyTree));
    });

    test('returns the rightmost key', () => {
      const key = lastKey(tree);
      assert.strictEqual(key, sortedValues[sortedValues.length - 1]);
    });
  });

  suite('lastValue()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(lastValue(emptyTree));
    });

    test('returns the rightmost value', () => {
      const value = lastValue(tree);
      assert.strictEqual(value, `#${sortedValues[sortedValues.length - 1]}`);
    });
  });

  suite('iterateFromLast()', () => {
    test('returns a reverse iterator starting from the rightmost node', () => {
      const it = iterateFromLast(tree);
      const expected = sortedValues.slice().reverse();
      assert.deepEqual(Array.from(it).map(n => n.key), expected);
    });

    test('the iterator should be in a completed state if the tree is empty', () => {
      const it = iterateFromLast(emptyTree);
      assert.isTrue(it.next().done);
    });
  });
});