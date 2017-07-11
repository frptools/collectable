import {assert} from 'chai';
import {emptyWithNumericKeys, size, isRedBlackTree} from '../../src';

suite('[RedBlackTree]', () => {
  suite('emptyWithNumericKeys()', () => {
    test('returns a tree of size 0', () => {
      const tree = emptyWithNumericKeys<number>();
      assert.strictEqual(size(tree), 0);
    });
  });

  suite('isRedBlackTree()', () => {
    test('returns true if the argument is a valid RedBlackTree instance', () => {
      const tree = emptyWithNumericKeys<number>();
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