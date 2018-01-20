import test from 'ava';
import { empty, fromArray, skipLast } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the same list if already empty', t => {
  var list = empty<any>();
  t.is(list, skipLast(2, list));
});

test('should return a list that excludes the specified number of elements from the end of the input list', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = skipLast(2, fromArray<any>(values));
  t.is(list._size, 4);
  t.deepEqual(arrayFrom(list), values.slice(0, 4));
});

test('should return an empty list if the input argument >= list.size', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = skipLast(6, fromArray<any>(values));
  t.is(list._size, 0);
});

test('should return the same list if the input argument === 0', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = fromArray<any>(values);
  t.is(list, skipLast(0, list));
});
