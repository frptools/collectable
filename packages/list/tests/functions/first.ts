import test from 'ava';
import { empty, first, fromArray } from '../../src';

test('should return undefined if the list is empty', t => {
  var list = empty<any>();
  t.is(first(list), void 0);
});

test('should return the first element in a list with multiple elements', t => {
  var list = fromArray<any>(['X', 'Y', 'Z']);
  t.is(first(list), 'X');
});

test('should return the only element in a single-element list', t => {
  var list = fromArray<any>(['K']);
  t.is(first(list), 'K');
});
