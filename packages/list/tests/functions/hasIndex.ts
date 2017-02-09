import {assert} from 'chai';
import {empty, fromArray, hasIndex} from '../../src';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[List]', () => {
  suite('hasIndex()', () => {
    test('returns false if the list is empty', () => {
      assert.isFalse(hasIndex(0, empty()));
    });

    test('returns false if the index is out of range', () => {
      var list0 = fromArray(['X', 'Y']);
      const size = Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR;
      var list1 = fromArray(makeValues(size));
      assert.isFalse(hasIndex(2, list0));
      assert.isFalse(hasIndex(20, list0));
      assert.isFalse(hasIndex(size, list1));
      assert.isFalse(hasIndex(size*2, list1));
    });

    test('returns true if the index is in range', () => {
      var list0 = fromArray(['X', 'Y']);
      const size = Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR;
      var list1 = fromArray(makeValues(size));
      assert.isTrue(hasIndex(0, list0));
      assert.isTrue(hasIndex(1, list0));
      assert.isTrue(hasIndex(0, list1));
      assert.isTrue(hasIndex(size - 1, list1));
    });

    test('treats a negative index as an offset from the end of the list', () => {
      var list = fromArray(['X', 'Y', 'Z']);
      assert.isTrue(hasIndex(-1, list));
      assert.isTrue(hasIndex(-2, list));
      assert.isTrue(hasIndex(-3, list));
      assert.isFalse(hasIndex(-4, list));
    });
  });
});