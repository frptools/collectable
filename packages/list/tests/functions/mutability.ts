import {assert} from 'chai';
import {modify, commit} from '@collectable/core';
import {fromArray, set, take, append, appendArray} from '../../src';
import {arrayFrom} from '../../src/internals';

suite('[List]', () => {
  suite('commit()', () => {
    test('should return the same list if already frozen', () => {
      const list = fromArray(['X', 'Y', 'Z']);
      assert.strictEqual(commit(list), list);
    });

    test('should cause common operations to avoid mutating the input list', () => {
      const values = ['X', 'Y', 'Z'];
      const list = commit(modify(fromArray(values)));
      const list1 = append('K', list);
      const list2 = set(1, 'K', list);
      const list3 = take(2, list);
      assert.notStrictEqual(list1, list);
      assert.notStrictEqual(list2, list);
      assert.notStrictEqual(list3, list);
      assert.deepEqual(arrayFrom(list), values);
      assert.deepEqual(arrayFrom(list1), values.concat('K'));
      assert.deepEqual(arrayFrom(list2), [values[0], 'K', values[2]]);
      assert.deepEqual(arrayFrom(list3), values.slice(0, 2));
    });
  });

  suite('modify()', () => {
    test('should return the same list if already unfrozen', () => {
      const list = modify(fromArray(['X', 'Y', 'Z']));
      assert.strictEqual(modify(list), list);
    });

    test('should return a new list if frozen', () => {
      const list = fromArray(['X', 'Y', 'Z']);
      assert.notStrictEqual(modify(list), list);
    });

    test('should cause common operations to directly mutate the input list', () => {
      const values = ['X', 'Y', 'Z'];
      const list = modify(fromArray(values));
      const list1 = appendArray(['A', 'B', 'C', 'D', 'E', 'F'], list);
      const list2 = set(5, 'K', list);
      const list3 = take(6, list);
      assert.strictEqual(list, list1);
      assert.strictEqual(list, list2);
      assert.strictEqual(list, list3);
      assert.deepEqual(arrayFrom(list), ['X', 'Y', 'Z', 'A', 'B', 'K']);
    });
  });
});