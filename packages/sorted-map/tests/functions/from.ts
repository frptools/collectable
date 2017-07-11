import {assert} from 'chai';
import {isImmutable} from '@collectable/core';
import {size, isEmpty, fromIterable} from '../../src';
import {fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  const values = ['A', 'B', 'C', 'D', 'E'];

  suite('fromArray()', () => {
    test('returns an empty map if the array is empty', () => {
      assert.isTrue(isEmpty(fromStringArray([])));
    });

    test('returns a map containing each unique item in the array', () => {
      assert.deepEqual(Array.from(fromStringArray(values)), pairsFrom(values));
    });

    test('the returned set has size equal to the number of unique items in the array', () => {
      assert.strictEqual(size(fromStringArray(values)), values.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isImmutable(fromStringArray(values)));
    });
  });

  suite('fromIterable()', () => {
    let it: IterableIterator<[string, number]>;
    setup(() => {
      it = new Map(pairsFrom(values)).entries();
    });

    test('returns an empty map if the iterable is empty', () => {
      assert.isTrue(isEmpty(fromIterable(new Set().values())));
    });

    test('returns a map containing each unique item emitted by the iterable', () => {
      assert.deepEqual(Array.from(fromIterable(it)), pairsFrom(values));
    });

    test('the returned set has size equal to the number of unique items emitted by the iterable', () => {
      assert.strictEqual(size(fromIterable(it)), values.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isImmutable(fromIterable(it)));
    });
  });
});