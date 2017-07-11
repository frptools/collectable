import {assert} from 'chai';
import {modify, isMutable, isImmutable} from '@collectable/core';
import {SortedSetStructure as SortedSet, union, size} from '../../src';
import {snapshot, fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  const mainValues = ['A', 'C', 'B', 'D', 'E'];
  const otherValues = ['F', 'D', 'E', 'G'];
  const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  let main: SortedSet<string>, mainSnapshot: object, result: SortedSet<string>;

  suite('union(SortedSet)', () => {
    let other: SortedSet<string>, otherSnapshot: object;

    setup(() => {
      other = fromStringArray(otherValues);
      otherSnapshot = snapshot(other);
    });

    suite('when the main set is mutable', () => {
      setup(() => {
        main = modify(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('the main set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the main set is still mutable', () => {
        assert.isTrue(isMutable(result));
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main set includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the main set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isImmutable(result));
      });

      test('the main set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main set includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('union(Array)', () => {
    const other = otherValues.slice();

    suite('when the input set is mutable', () => {
      setup(() => {
        main = modify(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
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

      test('the main set includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
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

      test('the main set includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('union(Iterable)', () => {
    let other: Iterable<string>;

    setup(() => {
      other = new Set(otherValues).values();
    });

    suite('when the input set is mutable', () => {
      setup(() => {
        main = modify(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('the input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isMutable(result));
      });

      test('the main set includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isImmutable(result));
      });

      test('the input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the main set includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });
});