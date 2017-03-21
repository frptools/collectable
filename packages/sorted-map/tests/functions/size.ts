import {assert} from 'chai';
import {empty, isEmpty, size} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedMap]', () => {
  suite('size()', () => {
    test('returns 0 for an empty map', () => {
      assert.strictEqual(size(empty()), 0);
    });

    test('returns the number of items in a map', () => {
      assert.strictEqual(size(fromStringArray(['A', 'B', 'C'])), 3);
    });
  });

  suite('isEmpty()', () => {
    test('returns true if the map contains no items', () => {
      assert.isTrue(isEmpty(empty()));
    });

    test('returns false if the map contains one or more items', () => {
      assert.isFalse(isEmpty(fromStringArray(['A', 'B', 'C'])));
    });
  });
});