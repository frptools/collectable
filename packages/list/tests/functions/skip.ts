import test from 'ava';
import { empty, fromArray, skip } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the same list if already empty', t => {
  var list = empty<any>();
  t.is(list, skip(2, list));
});

test('should return a list that excludes the specified number of elements from the start of the input list', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = skip(2, fromArray<any>(values));
  t.is(list._size, 4);
  t.deepEqual(arrayFrom(list), values.slice(2));
});

test('should return an empty list if the input argument >= list.size', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = skip(6, fromArray<any>(values));
  t.is(list._size, 0);
});

test('should return the same list if the input argument === 0', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = fromArray<any>(values);
  t.is(list, skip(0, list));
});
