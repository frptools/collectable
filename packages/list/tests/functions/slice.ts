import test from 'ava';
import { empty, fromArray, slice } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the same list if already empty', t => {
  var list = empty<any>();
  t.is(list, slice(1, 4, list));
});

test('should return a subset of the input list from the start index to the end index (exclusive)', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  t.deepEqual(arrayFrom(slice(0, 4, fromArray<any>(values))), values.slice(0, 4));
  t.deepEqual(arrayFrom(slice(2, 4, fromArray<any>(values))), values.slice(2, 4));
  t.deepEqual(arrayFrom(slice(3, values.length, fromArray<any>(values))), values.slice(3));
});

test('should treat negative indices as offsets from the end of the list', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  t.deepEqual(arrayFrom(slice(-4, -2, fromArray<any>(values))), values.slice(2, 4));
  t.deepEqual(arrayFrom(slice(-6, -1, fromArray<any>(values))), values.slice(0, 5));
  t.deepEqual(arrayFrom(slice(0, -1, fromArray<any>(values))), values.slice(0, 5));
  t.deepEqual(arrayFrom(slice(2, -1, fromArray<any>(values))), values.slice(2, 5));
  t.deepEqual(arrayFrom(slice(-4, values.length, fromArray<any>(values))), values.slice(2));
  t.deepEqual(arrayFrom(slice(-4, values.length - 2, fromArray<any>(values))), values.slice(2, 4));
});

test('should return an empty list if the slice range is outside the list bounds', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  t.deepEqual(arrayFrom(slice(3, 2, fromArray<any>(values))), []);
  t.deepEqual(arrayFrom(slice(values.length, values.length + 3, fromArray<any>(values))), []);
  t.deepEqual(arrayFrom(slice(-values.length - 2, -values.length - 5, fromArray<any>(values))), []);
});

test('should return the same list if the input arguments specify a superset of the list range', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = fromArray<any>(values);
  t.is(list, slice(0, values.length, list));
  t.is(list, slice(0, values.length + 10, list));
});
