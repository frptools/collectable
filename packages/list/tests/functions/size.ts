import {assert} from 'chai';
import {empty, size, fromArray, appendArray} from '../../src';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[List]', () => {
  suite('size()', () => {
    test('returns 0 if the list is empty', () => {
      assert.strictEqual(size(empty()), 0);
    });

    test('returns the size of a single-node list', () => {
      var list = fromArray(['X', 'Y']);
      assert.strictEqual(size(list), 2);
    });

    test('returns the correct size of a list with uncommitted changes', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      assert.strictEqual(size(appendArray(['X', 'Y'], fromArray(values))), values.length + 2);
    });
  });
});