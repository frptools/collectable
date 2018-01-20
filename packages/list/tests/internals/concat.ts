import test from 'ava';
import { concat, fromArray, prepend } from '../../src';
import { appendValues, arrayFrom, concatLists, createList } from '../../src/internals';
import { BRANCH_FACTOR, makeValues, rootSlot } from '../helpers';

test('joins two minimal single-node lists', t => {
  var left = appendValues(createList<any>(true), makeValues(1));
  var right = appendValues(createList<any>(true), makeValues(2, 1));

  concatLists(left, right);

  var root = rootSlot(left);
  t.false(root.isRelaxed());
  t.is(root.size, 3);
  t.deepEqual(arrayFrom(left), makeValues(3));
});

test('joins two single-level lists into a two-level result if capacity is exceeded', t => {
  var n0 = BRANCH_FACTOR/2 + 1;
  var n1 = n0 + 1;
  var left = appendValues(createList<any>(true), makeValues(n0));
  var right = appendValues(createList<any>(true), makeValues(n1, n0));

  concatLists(left, right);

  var root = rootSlot(left);
  t.true(root.isRelaxed());
  t.is(root.size, n0 + n1);
  t.deepEqual(arrayFrom(left), makeValues(n0 + n1));
});

test('joins two multi-level lists into a higher-level result if capacity is exceeded', t => {
  var m = BRANCH_FACTOR/2;
  var n0 = BRANCH_FACTOR*m + 1;
  var n1 = BRANCH_FACTOR*m + 3;
  var left = appendValues(createList<any>(true), makeValues(n0));
  var right = appendValues(createList<any>(true), makeValues(n1, n0));

  concatLists(left, right);

  var root = rootSlot(left);
  t.true(root.isRelaxed());
  t.is(root.size, n0 + n1);
  t.deepEqual(arrayFrom(left), makeValues(n0 + n1));
});

test('joins a deeper left list to a shallower right list', t => {
  var n0 = Math.pow(BRANCH_FACTOR, 2) + 1;
  var n1 = BRANCH_FACTOR + 1;
  var left = appendValues(createList<any>(true), makeValues(n0));
  var right = appendValues(createList<any>(true), makeValues(n1, n0));

  concatLists(left, right);

  t.true(left._right.parent.hasUncommittedChanges());
  t.true(left._right.parent.slot.isRelaxed());
  t.is(left._size, n0 + n1);
  t.deepEqual(arrayFrom(left), makeValues(n0 + n1));
});

test('joins a shallower left list to a deeper right list', t => {
  var n0 = BRANCH_FACTOR + 1;
  var n1 = Math.pow(BRANCH_FACTOR, 2) + 1;
  var left = appendValues(createList<any>(true), makeValues(n0));
  var right = appendValues(createList<any>(true), makeValues(n1, n0));

  concatLists(left, right);

  var root = rootSlot(left);
  t.true(root.isRelaxed());
  t.is(root.size, n0 + n1);
  t.deepEqual(arrayFrom(left), makeValues(n0 + n1));
});

test('joins lists when both lists each have pre-existing reserved head and tail views', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2) - (BRANCH_FACTOR >>> 2));
  var leftValues = values.slice(0, BRANCH_FACTOR + (BRANCH_FACTOR >>> 1));
  var rightValues = values.slice(leftValues.length);
  var list1 = prepend('X', fromArray<any>(leftValues));
  var list2 = prepend('Y', fromArray<any>(rightValues));
  leftValues.unshift('X');
  rightValues.unshift('Y');

  var list3 = concat(list1, list2);

  t.deepEqual(arrayFrom(list1), leftValues);
  t.deepEqual(arrayFrom(list2), rightValues);
  t.deepEqual(arrayFrom(list3), leftValues.concat(rightValues));
});
