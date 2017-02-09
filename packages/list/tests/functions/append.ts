import {assert} from 'chai';
import {empty, append, appendArray, appendIterable} from '../../src';
import {arrayFrom} from '../../src/internals';

suite('[List]', () => {
  suite('append()', () => {
    test('should not mutate the original List', () => {
      const list = empty<string>();
      const appended = append('foo', list);
      assert.strictEqual(list._size, 0);
      assert.strictEqual(list._left.slot.slots.length, 0);
      assert.notStrictEqual(list, appended);
      assert.notDeepEqual(list, appended);
    });

    test('should have size:1 after adding the first element', () => {
      const list = append('foo', empty<string>());
      assert.strictEqual(list._size, 1);
      assert.deepEqual(arrayFrom(list), ['foo']);
    });

    test('should have size:2 after adding the second element', () => {
      const list = append('bar', append('foo', empty<string>()));
      assert.strictEqual(list._size, 2);
      assert.deepEqual(arrayFrom(list), ['foo', 'bar']);
    });
  });

  suite('appendArray()', () => {
    test('should return the original list if called with an empty list', () => {
      const list = empty<string>();
      const appended = appendArray([], list);
      assert.strictEqual(list._size, 0);
      assert.strictEqual(list, appended);
    });

    test('should append each element in the array', () => {
      var values = ['foo', 'bar', 'baz'];
      const list = appendArray(values, empty<string>());
      assert.strictEqual(list._size, 3);
      assert.deepEqual(arrayFrom(list), values);
    });
  });

  suite('appendIterable()', () => {
    test('should return the original list if called with an empty iterable', () => {
      const list = empty<string>();
      const appended = appendIterable(new Set(), list);
      assert.strictEqual(list._size, 0);
      assert.strictEqual(list, appended);
    });

    test('should append each value iterated over', () => {
      var values = new Set(['foo', 'bar', 'baz']);
      const list = appendIterable(values, empty<string>());
      assert.strictEqual(list._size, 3);
      assert.sameMembers(arrayFrom(list), Array.from(values));
    });
  });
});