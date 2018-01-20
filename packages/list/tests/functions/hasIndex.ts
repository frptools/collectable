import test from 'ava';
import { empty, fromArray, hasIndex } from '../../src';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('returns false if the list is empty', t => {
  t.false(hasIndex(0, empty()));
});

test('returns false if the index is out of range', t => {
  var list0 = fromArray(['X', 'Y']);
  const size = Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR;
  var list1 = fromArray(makeValues(size));
  t.false(hasIndex(2, list0));
  t.false(hasIndex(20, list0));
  t.false(hasIndex(size, list1));
  t.false(hasIndex(size*2, list1));
});

test('returns true if the index is in range', t => {
  var list0 = fromArray(['X', 'Y']);
  const size = Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR;
  var list1 = fromArray(makeValues(size));
  t.true(hasIndex(0, list0));
  t.true(hasIndex(1, list0));
  t.true(hasIndex(0, list1));
  t.true(hasIndex(size - 1, list1));
});

test('treats a negative index as an offset from the end of the list', t => {
  var list = fromArray(['X', 'Y', 'Z']);
  t.true(hasIndex(-1, list));
  t.true(hasIndex(-2, list));
  t.true(hasIndex(-3, list));
  t.false(hasIndex(-4, list));
});