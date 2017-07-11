import {assert} from 'chai';
import {isImmutable, modify} from '@collectable/core';
import {empty, fromArray, appendArray, set, updateList, update} from '../../src';
import {arrayFrom} from '../../src/internals';

suite('[List]', () => {
  suite('updateList()', () => {
    // test('returns the same list if no changes are made', () => {
    //   const list = empty<string>();
    //   const list1 = updateList(list => {}, list);
    //   assert.strictEqual(list1, list);
    // });

    test('treats the inner list as mutable', () => {
      const list = empty<string>();
      const list1 = updateList(list => {
        assert.isFalse(isImmutable(list));
        appendArray(['X', 'Y', 'Z'], list);
        set(1, 'K', list);
      }, list);
      assert.isTrue(isImmutable(list1));
      assert.deepEqual(arrayFrom(list1), ['X', 'K', 'Z']);
    });
  });

  suite('update()', () => {
    test('returns the same list if no changes are made to the specified value', () => {
      const list = fromArray(['X', {foo: 'bar'}, 123]);
      assert.strictEqual(update(0, c => 'X', list), list);
      assert.strictEqual(update(1, o => o, list), list);
      assert.strictEqual(update(2, n => 123, list), list);
    });

    test('returns a new list if the new value is different to the existing value', () => {
      const list = fromArray(['X', {foo: 'bar'}, 123]);
      const list1 = update(0, c => 'K', list);
      const list2 = update(1, o => ({foo: 'baz'}), list);
      const list3 = update(2, n => 42, list);
      assert.notStrictEqual(list, list1);
      assert.notStrictEqual(list, list2);
      assert.notStrictEqual(list, list3);
      assert.deepEqual(arrayFrom(list1), ['K', {foo: 'bar'}, 123]);
      assert.deepEqual(arrayFrom(list2), ['X', {foo: 'baz'}, 123]);
      assert.deepEqual(arrayFrom(list3), ['X', {foo: 'bar'}, 42]);
    });

    test('returns the same list, modified with the updated value, if the list was not currently frozen', () => {
      const list = modify(fromArray(['X', {foo: 'bar'}, 123]));
      const list1 = update(0, c => 'K', list);
      const list2 = update(1, o => ({foo: 'baz'}), list);
      const list3 = update(2, n => 42, list);
      assert.strictEqual(list, list1);
      assert.strictEqual(list, list2);
      assert.strictEqual(list, list3);
      assert.deepEqual(arrayFrom(list), ['K', {foo: 'baz'}, 42]);
    });

    test('treats a negative index as an offset from the end of the list', () => {
      const list = fromArray(['X', {foo: 'bar'}, 123, 'xyz']);
      const list1 = update(-2, n => 42, list);
      assert.deepEqual(arrayFrom(list1), ['X', {foo: 'bar'}, 42, 'xyz']);
    });

    test('throws an error if the index is out of range', () => {
      assert.throws(() => update(0, c => 'X', empty()));
      assert.throws(() => update(2, c => 'X', fromArray(['X', 'Y'])));
    });
  });
});