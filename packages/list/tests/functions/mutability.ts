import {assert} from 'chai';
import {fromArray, freeze, thaw, set, take, append, appendArray, isFrozen} from '../../src';
import {arrayFrom} from '../../src/internals';

suite('[List]', () => {
  suite('freeze()', () => {
    test('should return the same list if already frozen', () => {
      const list = fromArray(['X', 'Y', 'Z']);
      assert.strictEqual(freeze(list), list);
    });

    test('should return a new list if not frozen', () => {
      const list = thaw(fromArray(['X', 'Y', 'Z']));
      assert.notStrictEqual(freeze(list), list);
    });

    test('should cause common operations to avoid mutating the input list', () => {
      const values = ['X', 'Y', 'Z'];
      const list = freeze(thaw(fromArray(values)));
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

  suite('thaw()', () => {
    test('should return the same list if already unfrozen', () => {
      const list = thaw(fromArray(['X', 'Y', 'Z']));
      assert.strictEqual(thaw(list), list);
    });

    test('should return a new list if frozen', () => {
      const list = fromArray(['X', 'Y', 'Z']);
      assert.notStrictEqual(thaw(list), list);
    });

    test('should cause common operations to directly mutate the input list', () => {
      const values = ['X', 'Y', 'Z'];
      const list = thaw(fromArray(values));
      const list1 = appendArray(['A', 'B', 'C', 'D', 'E', 'F'], list);
      const list2 = set(5, 'K', list);
      const list3 = take(6, list);
      assert.strictEqual(list, list1);
      assert.strictEqual(list, list2);
      assert.strictEqual(list, list3);
      assert.deepEqual(arrayFrom(list), ['X', 'Y', 'Z', 'A', 'B', 'K']);
    });
  });

  suite('isFrozen()', () => {
    test('should return true if the list is frozen', () => {
      const list = fromArray(['X', 'Y', 'Z']);
      assert.isTrue(isFrozen(list));
      assert.isTrue(isFrozen(freeze(thaw(list))));
    });

    test('should return false if the list is unfrozen', () => {
      const list = thaw(fromArray(['X', 'Y', 'Z']));
      assert.isFalse(isFrozen(list));
      assert.isFalse(isFrozen(thaw(freeze(list))));
    });
  });
});