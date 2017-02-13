import {assert} from 'chai';
import {empty} from '../../src';

suite('[RedBlackTree]', () => {
  suite('empty()', () => {
    test('should have size 0', () => {
      const tree = empty<number, number>();
      assert.strictEqual(tree._size, 0);
    });
  });
});