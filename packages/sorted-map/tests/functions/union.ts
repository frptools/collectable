import {assert} from 'chai';
import {union, thaw, isThawed, size, isFrozen} from '../../src';
import {SortedMap, snapshot, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  const mainValues = ['A', 'C', 'B', 'D', 'E'];
  const otherValues = ['F', 'D', 'E', 'G'];
  const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  let main: SortedMap, mainSnapshot: object, result: SortedMap;

  suite('union(SortedMap)', () => {
    let other: SortedMap, otherSnapshot: object;

    setup(() => {
      other = fromStringArray(otherValues);
      otherSnapshot = snapshot(other);
    });

    suite('when the main map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('the main map is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the main map is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the other input map is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main map includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the main map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('a new immutable map is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the main map is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the other input map is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main map includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('union(Array)', () => {
    const other = pairsFrom(otherValues);

    suite('when the input map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
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

      test('the main map includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
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

      test('the main map includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('union(Iterable)', () => {
    let other: Iterable<[string, number]>;

    setup(() => {
      other = new Map(pairsFrom(otherValues)).entries();
    });

    suite('when the input map is mutable', () => {
      setup(() => {
        main = thaw(fromStringArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('the input map is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input map is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the main map includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input map is immutable', () => {
      setup(() => {
        main = fromStringArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('a new immutable map is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input map is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the main map includes all items from both inputs', () => {
        assert.deepEqual(Array.from(result), pairsFrom(expectedValues));
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });
});