import {assert} from 'chai';
import {emptyWithNumericKeys, size, isEmpty} from '../../src';
import {RedBlackTreeStructure} from '../../src/internals';
import {createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeStructure<any, any>,
    emptyTree: RedBlackTreeStructure<any, any>;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = <RedBlackTreeStructure<any, any>>emptyWithNumericKeys();
    tree = createTree();
  });

  suite('size()', () => {
    test('returns 0 if the tree is empty', () => {
      assert.strictEqual(size(emptyTree), 0);
    });

    test('returns the number of elements in the tree', () => {
      assert.strictEqual(size(tree), sortedValues.length);
    });
  });

  suite('isEmpty()', () => {
    test('returns true if the tree is empty', () => {
      assert.isTrue(isEmpty(emptyTree));
    });

    test('returns false if the tree is not empty', () => {
      assert.isFalse(isEmpty(tree));
    });
  });
});
