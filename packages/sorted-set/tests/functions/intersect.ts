import {assert} from 'chai';
import {SortedSet as SortedSet, intersect, thaw, isThawed, has, size, isFrozen} from '../../src';
import {snapshot, fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  const mainValues = ['B', 'C', 'A', 'D', 'E'];
  const otherValues = ['F', 'E', 'D', 'G'];
  const expectedValues = ['D', 'E'];

  let main: SortedSet<string>, mainSnapshot: object, result: SortedSet<string>;

  suite('intersect(SortedSet)', () => {
    let other: SortedSet<string>, otherSnapshot: object;

    setup(() => {
      other = fromStringArray(otherValues);
      otherSnapshot = snapshot(other);
    });

    suite('when the main set is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('the main input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the main set is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main set excludes items that are not also members of the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the main set retains items that are also members of the other input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the size of the main set is decreased by the number of items that were unique to it', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the main set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the main input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the new set excludes items that are unique to the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the new set excludes items that are unique to the main input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the new set includes items that are common to both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
      });

      test('the size of the new set is equal to the total number of items that are common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('intersect(Array)', () => {
    const other = otherValues.slice();

    suite('when the input set is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('the input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, otherValues);
      });

      test('the input set excludes items that are not also members of the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the input set retains items that are also members of the other input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the size of the input set is decreased by the number of items that were unique to it', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, otherValues);
      });

      test('the new set excludes items that are unique to the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the new set excludes items that are unique to the main input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the new set includes items that are common to both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
      });

      test('the size of the new set is equal to the total number of items that are common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('intersect(Iterable)', () => {
    let other: Iterable<string>;

    setup(() => {
      other = new Set(otherValues).values();
    });

    suite('when the input set is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('the input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the input set excludes items that are not also members of the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the input set retains items that are also members of the other input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the size of the input set is decreased by the number of items that were unique to it', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the new set excludes items that are unique to the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the new set excludes items that are unique to the main input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the new set includes items that are common to both inputs', () => {
        assert.deepEqual(Array.from(result), expectedValues);
      });

      test('the size of the new set is equal to the total number of items that are common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });
});