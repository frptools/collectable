import {assert} from 'chai';
import {intersect, thaw, isThawed, has, size, isFrozen} from '../../src';
import {SortedMap, snapshot, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  const mainValues = ['B', 'C', 'A', 'D', 'E'];
  const otherValues = ['F', 'E', 'D', 'G'];
  const expectedValues = ['D', 'E'];

  let main: SortedMap, mainSnapshot: object, result: SortedMap;

  suite('intersect(SortedMap)', () => {
    let other: SortedMap, otherSnapshot: object;

    setup(() => {
      other = fromStringArray(otherValues);
      otherSnapshot = snapshot(other);
    });

    suite('when the main map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('the main input map is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the main map is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the other input map is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main map excludes items that are not also members of the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the main map retains items that are also members of the other input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the size of the main map is decreased by the number of items that were unique to it', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the main map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('a new immutable map is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the main input map is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the other input map is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the new map excludes items that are unique to the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the new map excludes items that are unique to the main input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the new map includes items that are common to both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
      });

      test('the size of the new map is equal to the total number of items that are common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('intersect(Array)', () => {
    const other = pairsFrom(otherValues);

    suite('when the input map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('the input map is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input map is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, pairsFrom(otherValues));
      });

      test('the input map excludes items that are not also members of the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the input map retains items that are also members of the other input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the size of the input map is decreased by the number of items that were unique to it', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('a new immutable map is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input map is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, pairsFrom(otherValues));
      });

      test('the new map excludes items that are unique to the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the new map excludes items that are unique to the main input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the new map includes items that are common to both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
      });

      test('the size of the new map is equal to the total number of items that are common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('intersect(Iterable)', () => {
    let other: Iterable<[string, number]>;

    setup(() => {
      other = new Map(pairsFrom(otherValues)).entries();
    });

    suite('when the input map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('the input map is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input map is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the input map excludes items that are not also members of the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the input map retains items that are also members of the other input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the size of the input map is decreased by the number of items that were unique to it', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = intersect(other, main);
      });

      test('a new immutable map is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input map is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the new map excludes items that are unique to the other input', () => {
        assert.isFalse(has('A', result));
        assert.isFalse(has('B', result));
        assert.isFalse(has('C', result));
      });

      test('the new map excludes items that are unique to the main input', () => {
        assert.isTrue(has('D', result));
        assert.isTrue(has('E', result));
      });

      test('the new map includes items that are common to both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
      });

      test('the size of the new map is equal to the total number of items that are common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });
});