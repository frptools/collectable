import {assert} from 'chai';
import {empty, skip, skipLast, take, takeLast, slice, fromArray} from '../../src';
import {arrayFrom} from '../../src/internals';

suite('[List]', () => {
  suite('skip()', () => {
    test('should return the same list if already empty', () => {
      var list = empty<any>();
      assert.strictEqual(list, skip(2, list));
    });

    test('should return a list that excludes the specified number of elements from the start of the input list', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = skip(2, fromArray<any>(values));
      assert.strictEqual(list._size, 4);
      assert.deepEqual(arrayFrom(list), values.slice(2));
    });

    test('should return an empty list if the input argument >= list.size', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = skip(6, fromArray<any>(values));
      assert.strictEqual(list._size, 0);
    });

    test('should return the same list if the input argument === 0', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = fromArray<any>(values);
      assert.strictEqual(list, skip(0, list));
    });
  });

  suite('skipEnd()', () => {
    test('should return the same list if already empty', () => {
      var list = empty<any>();
      assert.strictEqual(list, skipLast(2, list));
    });

    test('should return a list that excludes the specified number of elements from the end of the input list', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = skipLast(2, fromArray<any>(values));
      assert.strictEqual(list._size, 4);
      assert.deepEqual(arrayFrom(list), values.slice(0, 4));
    });

    test('should return an empty list if the input argument >= list.size', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = skipLast(6, fromArray<any>(values));
      assert.strictEqual(list._size, 0);
    });

    test('should return the same list if the input argument === 0', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = fromArray<any>(values);
      assert.strictEqual(list, skipLast(0, list));
    });
  });

  suite('take()', () => {
    test('should return the same list if already empty', () => {
      var list = empty<any>();
      assert.strictEqual(list, take(4, list));
    });

    test('should return a list that contains the specified number of elements from the start of the input list', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = take(4, fromArray<any>(values));
      assert.strictEqual(list._size, 4);
      assert.deepEqual(arrayFrom(list), values.slice(0, 4));
    });

    test('should return an empty list if the input argument === 0', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = take(0, fromArray<any>(values));
      assert.strictEqual(list._size, 0);
    });

    test('should return the same list if the input argument >= list.size', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = fromArray<any>(values);
      assert.strictEqual(list, take(values.length, list));
    });
  });

  suite('takeLast()', () => {
    test('should return the same list if already empty', () => {
      var list = empty<any>();
      assert.strictEqual(list, takeLast(4, list));
    });

    test('should return a list that includes the specified number of elements from the end of the input list', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = takeLast(4, fromArray<any>(values));
      assert.strictEqual(list._size, 4);
      assert.deepEqual(arrayFrom(list), values.slice(2));
    });

    test('should return an empty list if the input argument === 0', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = takeLast(0, fromArray<any>(values));
      assert.strictEqual(list._size, 0);
    });

    test('should return the same list if the input argument >= list.size', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = fromArray<any>(values);
      assert.strictEqual(list, takeLast(values.length, list));
    });
  });

  suite('slice()', () => {
    test('should return the same list if already empty', () => {
      var list = empty<any>();
      assert.strictEqual(list, slice(1, 4, list));
    });

    test('should return a subset of the input list from the start index to the end index (exclusive)', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      assert.deepEqual(arrayFrom(slice(0, 4, fromArray<any>(values))), values.slice(0, 4));
      assert.deepEqual(arrayFrom(slice(2, 4, fromArray<any>(values))), values.slice(2, 4));
      assert.deepEqual(arrayFrom(slice(3, values.length, fromArray<any>(values))), values.slice(3));
    });

    test('should treat negative indices as offsets from the end of the list', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      assert.deepEqual(arrayFrom(slice(-4, -2, fromArray<any>(values))), values.slice(2, 4));
      assert.deepEqual(arrayFrom(slice(-6, -1, fromArray<any>(values))), values.slice(0, 5));
      assert.deepEqual(arrayFrom(slice(0, -1, fromArray<any>(values))), values.slice(0, 5));
      assert.deepEqual(arrayFrom(slice(2, -1, fromArray<any>(values))), values.slice(2, 5));
      assert.deepEqual(arrayFrom(slice(-4, values.length, fromArray<any>(values))), values.slice(2));
      assert.deepEqual(arrayFrom(slice(-4, values.length - 2, fromArray<any>(values))), values.slice(2, 4));
    });

    test('should return an empty list if the slice range is outside the list bounds', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      assert.deepEqual(arrayFrom(slice(3, 2, fromArray<any>(values))), []);
      assert.deepEqual(arrayFrom(slice(values.length, values.length + 3, fromArray<any>(values))), []);
      assert.deepEqual(arrayFrom(slice(-values.length - 2, -values.length - 5, fromArray<any>(values))), []);
    });

    test('should return the same list if the input arguments specify a superset of the list range', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = fromArray<any>(values);
      assert.strictEqual(list, slice(0, values.length, list));
      assert.strictEqual(list, slice(0, values.length + 10, list));
    });
  });
});
