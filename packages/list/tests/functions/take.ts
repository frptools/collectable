import test from 'ava';
import { empty, fromArray, take } from '../../src';
import { arrayFrom } from '../../src/internals';

test('should return the same list if already empty', t => {
  var list = empty<any>();
  t.is(list, take(4, list));
});

test('should return a list that contains the specified number of elements from the start of the input list', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = take(4, fromArray<any>(values));
  t.is(list._size, 4);
  t.deepEqual(arrayFrom(list), values.slice(0, 4));
});

test('should return an empty list if the input argument === 0', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = take(0, fromArray<any>(values));
  t.is(list._size, 0);
});

test('should return the same list if the input argument >= list.size', t => {
  var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  var list = fromArray<any>(values);
  t.is(list, take(values.length, list));
});
