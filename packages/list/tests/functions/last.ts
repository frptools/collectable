import test from 'ava';
import { empty, fromArray, last } from '../../src';

test('should return undefined if the list is empty', t => {
  var list = empty<any>();
  t.is(last(list), void 0);
});

test('should return the last element in a list with multiple elements', t => {
  var list = fromArray<any>(['X', 'Y', 'Z']);
  t.is(last(list), 'Z');
});

test('should return the only element in a single-element list', t => {
  var list = fromArray<any>(['X']);
  t.is(last(list), 'X');
});
