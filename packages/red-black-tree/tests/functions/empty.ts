import {assert} from 'chai';
import {empty, size, isRedBlackTree} from '../../src';

suite('[RedBlackTree]', () => {
  suite('empty()', () => {
    test('returns a tree of size 0', () => {
      const tree = empty<number, number>();
      assert.strictEqual(size(tree), 0);
    });
  });

  suite('isRedBlackTree()', () => {
    test('returns true if the argument is a valid RedBlackTree instance', () => {
      const tree = empty<number, number>();
      assert.isTrue(isRedBlackTree(tree));
    });
    test('returns false if the argument is not a valid RedBlackTree instance', () => {
      assert.isFalse(isRedBlackTree(<any>0));
      assert.isFalse(isRedBlackTree(<any>1));
      assert.isFalse(isRedBlackTree(<any>'foo'));
      assert.isFalse(isRedBlackTree(<any>null));
      assert.isFalse(isRedBlackTree(<any>void 0));
      assert.isFalse(isRedBlackTree(<any>{}));
      assert.isFalse(isRedBlackTree(<any>Symbol()));
    });
  });
});