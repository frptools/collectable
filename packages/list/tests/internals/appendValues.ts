import test from 'ava';
import { appendValues, arrayFrom, createList, getAtOrdinal } from '../../src/internals';
import { BRANCH_FACTOR, makeValues, } from '../helpers';

test('a single value appended to an empty list is present in the list', t => {
  var list = createList<any>(true);
  appendValues(list, ['X']);
  t.is(getAtOrdinal(list, 0), 'X');
});

test('one order of magnitude of values appended to an empty list are all present in the list', t => {
  var list = createList<any>(true);
  var values = makeValues(BRANCH_FACTOR);
  appendValues(list, values);
  t.deepEqual(arrayFrom(list), values);
});

test('two orders of magnitude of values appended to an empty list are all present in the list', t => {
  var list = createList<any>(true);
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
  appendValues(list, values);
  t.deepEqual(arrayFrom(list), values);
});

test('three orders of magnitude of values appended to an empty list are all present in the list', t => {
  var list = createList<any>(true);
  var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
  appendValues(list, values);
  t.deepEqual(arrayFrom(list), values);
});

test('values added to a list one-by-one are all present in the list', t => {
  var list = createList<any>(true);
  var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
  for(var i = 0; i < values.length; i++) {
    appendValues(list, [values[i]]);
  }
  for(i = 0; i < values.length; i++) {
    t.is(getAtOrdinal(list, i), values[i], `incorrect value at index ${i}`);
  }
});
