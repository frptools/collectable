import {assert} from 'chai';
import {RedBlackTreeEntry, at, keyAt, valueAt, indexOf, iterateFromIndex} from '../../src';
import {RedBlackTreeStructure} from '../../src/internals';
import {empty, createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeStructure<any, any>, emptyTree: RedBlackTreeStructure<any, any>;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('at()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(at(0, emptyTree));
    });

    test('returns undefined if the index is out of range', () => {
      assert.isUndefined(at(sortedValues.length, tree));
    });

    test('returns a pointer to the node at the specified index (negative index offset from the right)', () => {
      const node0 = <RedBlackTreeEntry<any, any>>at(25, tree);
      assert.isDefined(node0);
      assert.strictEqual(node0.key, sortedValues[25]);
      assert.strictEqual(node0.value, `#${sortedValues[25]}`);
      const node1 = <RedBlackTreeEntry<any, any>>at(200, tree);
      assert.isDefined(node1);
      assert.strictEqual(node1.key, sortedValues[200]);
      assert.strictEqual(node1.value, `#${sortedValues[200]}`);
      const node2 = <RedBlackTreeEntry<any, any>>at(-25, tree);
      assert.isDefined(node2);
      assert.strictEqual(node2.key, sortedValues[sortedValues.length - 25]);
      assert.strictEqual(node2.value, `#${sortedValues[sortedValues.length - 25]}`);
    });
  });

  suite('keyAt()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(keyAt(0, emptyTree));
    });

    test('returns undefined if the index is out of range', () => {
      assert.isUndefined(keyAt(sortedValues.length, tree));
    });

    test('returns the key at the specified index (negative index offset from the right)', () => {
      assert.strictEqual(keyAt(25, tree), sortedValues[25]);
    });
  });

  suite('valueAt()', () => {
    test('returns undefined if the tree is empty', () => {
      assert.isUndefined(valueAt(0, emptyTree));
    });

    test('returns undefined if the index is out of range', () => {
      assert.isUndefined(valueAt(sortedValues.length, tree));
    });

    test('returns the value at the specified index (negative index offset from the right)', () => {
      assert.strictEqual(valueAt(25, tree), `#${sortedValues[25]}`);
      assert.strictEqual(valueAt(-25, tree), `#${sortedValues[sortedValues.length - 25]}`);
    });
  });

  suite('indexOf()', () => {
    test('returns -1 if the key is not found', () => {
      assert.strictEqual(indexOf(1, tree), -1);
    });

    test('returns the correct index for any valid key', () => {
      for(var i = 0; i < sortedValues.length; i++) {
        assert.strictEqual(indexOf(sortedValues[i], tree), i);
      }
    });
  });

  suite('iterateFromIndex()', () => {
    test('returns an iterator starting from the specified index (negative index offset from the right)', () => {
      const expectedLeft = sortedValues.slice(25);
      const expectedRight = sortedValues.slice(sortedValues.length - 25);
      const expectedLeftReversed = sortedValues.slice(0, 25 + 1).reverse();
      const expectedRightReversed = sortedValues.slice(0, sortedValues.length - 25 + 1).reverse();

      const arrayLeft = Array.from(iterateFromIndex(false, 25, tree)).map(v => v.key);
      const arrayRight = Array.from(iterateFromIndex(false, -25, tree)).map(v => v.key);
      const arrayLeftReversed = Array.from(iterateFromIndex(true, 25, tree)).map(v => v.key);
      const arrayRightReversed = Array.from(iterateFromIndex(true, -25, tree)).map(v => v.key);

      assert.deepEqual(arrayLeft, expectedLeft);
      assert.deepEqual(arrayRight, expectedRight);
      assert.deepEqual(arrayLeftReversed, expectedLeftReversed);
      assert.deepEqual(arrayRightReversed, expectedRightReversed);
    });

    test('the iterator should be in a completed state if the resolved index is out of range', () => {
      assert.isTrue(iterateFromIndex(false, sortedValues.length, tree).next().done);
      assert.isTrue(iterateFromIndex(false, -1 - sortedValues.length, tree).next().done);
      assert.isTrue(iterateFromIndex(true, sortedValues.length, tree).next().done);
      assert.isTrue(iterateFromIndex(true, -1 - sortedValues.length, tree).next().done);
    });
  });
});