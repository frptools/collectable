import {assert} from 'chai';
import {set} from '../../src';
import {empty, represent} from '../test-utils';

suite('[RedBlackTree]', () => {
  suite('set()', () => {
    test('should replace the root of an empty list', () => {
      const tree = set(1, 1, empty());
      assert.strictEqual(tree._size, 1);
      assert.strictEqual(tree._root.value, 1);
    });

    test('should add the second entry as a child of the root', () => {
      const tree0 = set(1, 1, empty());
      const tree1 = set(2, 2, empty());
      assert.notStrictEqual(tree0, tree1);
      assert.notStrictEqual(tree0._root, tree1._root);
      assert.deepEqual(represent(tree0), [['black', 1]]);
      assert.deepEqual(represent(tree1), [['black', 1], [['red', 2]]]);
    });

    test('should maintain the uniform black node path length constraint');
    test('should prevent the adjacency of red nodes with other red nodes');
  });
});