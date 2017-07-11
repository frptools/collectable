import {assert} from 'chai';
import {isImmutable} from '@collectable/core';
import {size, isEmpty, fromIterable} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  const values = ['A', 'B', 'C', 'D', 'E'];

  suite('fromArray()', () => {
    test('returns an empty set if the array is empty', () => {
      assert.isTrue(isEmpty(fromStringArray([])));
    });

    test('returns a set containing each unique item in the array', () => {
      assert.deepEqual(Array.from(fromStringArray(values)), values);
    });

    test('the returned set has size equal to the number of unique items in the array', () => {
      assert.strictEqual(size(fromStringArray(values)), values.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isImmutable(fromStringArray(values)));
    });
  });

  suite('fromIterable()', () => {
    let it: IterableIterator<string>;
    setup(() => {
      it = new Set(values).values();
    });

    test('returns an empty set if the iterable is empty', () => {
      assert.isTrue(isEmpty(fromIterable(new Set().values())));
    });

    test('returns a set containing each unique item emitted by the iterable', () => {
      assert.deepEqual(Array.from(fromIterable(it)), values);
    });

    test('the returned set has size equal to the number of unique items emitted by the iterable', () => {
      assert.strictEqual(size(fromIterable(it)), values.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isImmutable(fromIterable(it)));
    });
  });
});