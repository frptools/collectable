import {assert} from 'chai';
import {isImmutable} from '@collectable/core';
import {size, isEmpty, fromArray, fromIterable, fromNativeSet} from '../../src';

suite('[HashSet]', () => {
  const values = ['A', 'B', 'C', 'D', 'E'];

  suite('fromArray()', () => {
    test('returns an empty set if the array is empty', () => {
      assert.isTrue(isEmpty(fromArray([])));
    });

    test('returns a set containing each unique item in the array', () => {
      assert.sameMembers(Array.from(fromArray(values)), values);
    });

    test('the returned set has size equal to the number of unique items in the array', () => {
      assert.strictEqual(size(fromArray(values)), values.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isImmutable(fromArray(values)));
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
      assert.sameMembers(Array.from(fromIterable(it)), values);
    });

    test('the returned set has size equal to the number of unique items emitted by the iterable', () => {
      assert.strictEqual(size(fromIterable(it)), values.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isImmutable(fromIterable(it)));
    });
  });

  suite('fromNativeSet()', () => {
    const nativeSet = new Set(values);

    test('returns an empty set if the input set is empty', () => {
      assert.isTrue(isEmpty(fromNativeSet(new Set())));
    });

    test('returns a set containing the same items from the input set', () => {
      assert.sameMembers(Array.from(fromNativeSet(nativeSet)), values);
    });

    test('the returned set has the same size as the input set', () => {
      assert.strictEqual(size(fromNativeSet(nativeSet)), values.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isImmutable(fromNativeSet(nativeSet)));
    });
  });
});