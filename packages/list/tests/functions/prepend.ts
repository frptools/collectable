import {assert} from 'chai';
import {empty, prepend, prependArray, prependArrayMapped, prependIterable} from '../../src';
import {arrayFrom} from '../../src/internals';

suite('[List]', () => {
  suite('prepend()', () => {
    test('should not mutate the original List', () => {
      const list = empty<string>();
      const prepended = prepend('foo', list);
      assert.strictEqual(list._size, 0);
      assert.strictEqual(list._left.slot.slots.length, 0);
      assert.notStrictEqual(list, prepended);
      assert.notDeepEqual(list, prepended);
    });

    test('should have size:1 after adding the first element', () => {
      const list = prepend('foo', empty<string>());
      assert.strictEqual(list._size, 1);
      assert.deepEqual(arrayFrom(list), ['foo']);
    });

    test('should have size:2 after adding the second element', () => {
      const list = prepend('bar', prepend('foo', empty<string>()));
      assert.strictEqual(list._size, 2);
      assert.deepEqual(arrayFrom(list), ['bar', 'foo']);
    });
  });

  suite('prependArray()', () => {
    test('should return the original list if called with an empty list', () => {
      const list = empty<string>();
      const prepended = prependArray([], list);
      assert.strictEqual(list._size, 0);
      assert.strictEqual(list, prepended);
    });

    test('should append elements so that their order in the list matches the source array', () => {
      var values = ['foo', 'bar', 'baz'];
      const list = prependArray(values, empty<string>());
      assert.strictEqual(list._size, 3);
      assert.deepEqual(arrayFrom(list), values);
    });
  });

  suite('prependArrayMapped()', () => {
    const fn = (s: string, i: number) => `[${s}, ${i}]`;

    test('should return the original list if called with an empty list', () => {
      const list = empty<string>();
      const prepended = prependArrayMapped(fn, [], list);
      assert.strictEqual(list._size, 0);
      assert.strictEqual(list, prepended);
    });

    test('should append elements so that their order in the list matches the source array', () => {
      const values = ['foo', 'bar', 'baz'];
      const mappedValues = values.map(fn);
      const list = prependArrayMapped(fn, values, empty<string>());
      assert.strictEqual(list._size, 3);
      assert.deepEqual(arrayFrom(list), mappedValues);
    });
  });

  suite('prependIterable()', () => {
    test('should return the original list if called with an empty iterable', () => {
      const list = empty<string>();
      const prepended = prependIterable(new Set(), list);
      assert.strictEqual(list._size, 0);
      assert.strictEqual(list, prepended);
    });

    test('should prepend each value iterated over', () => {
      var values = new Set(['foo', 'bar', 'baz']);
      const list = prependIterable(values, empty<string>());
      assert.strictEqual(list._size, 3);
      assert.sameMembers(arrayFrom(list), Array.from(values));
    });
  });
});