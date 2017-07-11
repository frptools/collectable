import {assert} from 'chai';
import {modify, isMutable, isImmutable} from '@collectable/core';
import {SortedSetStructure as SortedSet, subtract, has, size} from '../../src';
import {snapshot, fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  const mainValues = ['D', 'E', 'C', 'A', 'B'];
  const otherValues = ['D', 'E', 'F', 'G'];
  const expectedValues = ['A', 'B', 'C'];

  let main: SortedSet<string>, mainSnapshot: object, result: SortedSet<string>;

  suite('subtract(SortedSet)', () => {
    let other: SortedSet<string>, otherSnapshot: object;

    setup(() => {
      other = fromStringArray(otherValues);
      otherSnapshot = snapshot(other);
    });

    suite('when the main set is mutable', () => {
      setup(() => {
        main = modify(fromStringArray(mainValues));
        result = subtract(other, main);
      });

      test('the main input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the main set is still mutable', () => {
        assert.isTrue(isMutable(result));
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main set no longer includes any items that are members of the other set', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the main set retains items that are not members of the other set', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the main set is decreased by the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the main set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = subtract(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isImmutable(result));
      });

      test('the main input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the new set does not include any items that are members of the other set', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the new set includes all items from the main input set that are not members of the other set', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the new set is that of the input set, minus the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('subtract(Array)', () => {
    const other = otherValues.slice();

    suite('when the input set is mutable', () => {
      setup(() => {
        main = modify(fromStringArray(mainValues));
        result = subtract(other, main);
      });

      test('the input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isMutable(result));
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, otherValues);
      });

      test('the input set no longer includes any items that are members of the input array', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the input set retains items that are not members of the input array', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the input set is decreased by the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = subtract(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isImmutable(result));
      });

      test('the input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, otherValues);
      });

      test('the new set does not include any items that are members of the input array', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the new set includes all items from the input set that are not members of the input array', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the new set is that of the input set, minus the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('subtract(Iterable)', () => {
    let other: Iterable<string>;

    setup(() => {
      other = new Set(otherValues).values();
    });

    suite('when the input set is mutable', () => {
      setup(() => {
        main = modify(fromStringArray(mainValues));
        result = subtract(other, main);
      });

      test('the input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isMutable(result));
      });

      test('the input set no longer includes any items that were emitted by the input iterable', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the input set retains items that were not emitted by the input iterable', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the input set is decreased by the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = subtract(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isImmutable(result));
      });

      test('the input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the new set does not include any items that were emitted by the input iterable', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the new set includes all items from the input set that were not emitted by the input iterable', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the new set is that of the input set, minus the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });
});