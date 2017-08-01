import {assert} from 'chai';
import {empty, zero} from '../../src';

suite('[List]', () => {
  suite('empty()', () => {
    test('should have size 0', () => {
      const list = empty<string>();
      assert.strictEqual(list._size, 0);
    });
  });
  suite('zero()', () => {
    test('is an alias of empty', () => {
      assert.strictEqual(empty, zero);
    });
  });
});