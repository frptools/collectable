import {assert} from 'chai';
import {subtract, thaw, isThawed, has, size, isFrozen} from '../../src';
import {SortedMap, snapshot, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  const mainValues = ['D', 'E', 'C', 'A', 'B'];
  const otherValues = ['D', 'E', 'F', 'G'];
  const expectedValues = ['A', 'B', 'C'];

  let main: SortedMap, mainSnapshot: object, result: SortedMap;

  suite('subtract(SortedMap)', () => {
    let other: SortedMap, otherSnapshot: object;

    setup(() => {
      other = fromStringArray(otherValues);
      otherSnapshot = snapshot(other);
    });

    suite('when the main map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        result = subtract(other, main);
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

      test('the main map no longer includes any items that are members of the other map', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the main map retains items that are not members of the other map', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the main map is decreased by the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the main map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = subtract(other, main);
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

      test('the new map does not include any items that are members of the other map', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the new map includes all items from the main input map that are not members of the other map', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the new map is that of the input map, minus the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('subtract(Array)', () => {
    const other = pairsFrom(otherValues);

    suite('when the input map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        result = subtract(other, main);
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

      test('the input map no longer includes any items that are members of the input array', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the input map retains items that are not members of the input array', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the input map is decreased by the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = subtract(other, main);
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

      test('the new map does not include any items that are members of the input array', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the new map includes all items from the input map that are not members of the input array', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the new map is that of the input map, minus the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('subtract(Iterable)', () => {
    let other: Iterable<[string, number]>;

    setup(() => {
      other = new Map(pairsFrom(otherValues)).entries();
    });

    suite('when the input map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        result = subtract(other, main);
      });

      test('the input map is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input map is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the input map no longer includes any items that were emitted by the input iterable', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the input map retains items that were not emitted by the input iterable', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the input map is decreased by the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = subtract(other, main);
      });

      test('a new immutable map is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input map is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the new map does not include any items that were emitted by the input iterable', () => {
        assert.isTrue(has('A', result));
        assert.isTrue(has('B', result));
        assert.isTrue(has('C', result));
      });

      test('the new map includes all items from the input map that were not emitted by the input iterable', () => {
        assert.isFalse(has('D', result));
        assert.isFalse(has('E', result));
      });

      test('the size of the new map is that of the input map, minus the number of items that were common to both inputs', () => {
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });
});