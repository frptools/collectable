import {assert} from 'chai';
import {empty, isEmpty, size, fromArray} from '../../src';

suite('[Set]', () => {
  suite('size()', () => {
    test('returns 0 for an empty set', () => {
      assert.strictEqual(size(empty()), 0);
    });

    test('returns the number of items in a set', () => {
      assert.strictEqual(size(fromArray(['A', 'B', 'C'])), 3);
    });
  });

  suite('isEmpty()', () => {
    test('returns true if the set contains no items', () => {
      assert.isTrue(isEmpty(empty()));
    });

    test('returns false if the set contains one or more items', () => {
      assert.isFalse(isEmpty(fromArray(['A', 'B', 'C'])));
    });
  });
});