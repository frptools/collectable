import test from 'ava';
import { appendArray, concatAll, empty, fromArray, get, prepend } from '../../src';
import { BRANCH_FACTOR, listOf, makeValues, text } from '../helpers';

test('should return undefined if the list is empty', t => {
  var list = empty<any>();
  t.is(get(0, list), void 0);
});

test('should return undefined if the index is out of range', t => {
  var list = fromArray<any>(['X', 'Y', 'Z']);
  t.is(get(3, list), void 0);
  t.is(get(-4, list), void 0);
});

test('should return the element at each specified index', t => {
  var list = fromArray<any>(['X', 'Y', 'Z']);
  t.is(get(2, list), 'Z');
  t.is(get(1, list), 'Y');
  t.is(get(0, list), 'X');
});

test('should treat negative numbers as offsets from the end of the list', t => {
  var list = fromArray<any>(['X', 'Y', 'Z']);
  t.is(get(-1, list), 'Z');
  t.is(get(-2, list), 'Y');
  t.is(get(-3, list), 'X');
});

test('should return the correct element when it exists in the tail', t => {
  t.is(get(0, listOf(2)), text(0));
  t.is(get(BRANCH_FACTOR, listOf(BRANCH_FACTOR + 1)), text(BRANCH_FACTOR));
  t.is(get(1056, listOf(1057)), text(1056));
});

test('should return the correct element when pathing through regular nodes', t => {
  t.is(get(2, listOf(BRANCH_FACTOR + 1)), text(2));
  t.is(get(BRANCH_FACTOR - 1, listOf(BRANCH_FACTOR)), text(BRANCH_FACTOR - 1));
  t.is(get(2, listOf(BRANCH_FACTOR*BRANCH_FACTOR + BRANCH_FACTOR + 1)), text(2));
});

test('should return the correct element when pathing through relaxed nodes', t => {
  t.is(get(1, concatAll([
    listOf(1),
    listOf(BRANCH_FACTOR, 1),
    listOf(1, BRANCH_FACTOR + 1)
  ])), text(1));
  t.is(get(BRANCH_FACTOR, concatAll([
    listOf(BRANCH_FACTOR - 1),
    listOf(BRANCH_FACTOR - 1, BRANCH_FACTOR - 1),
    listOf(16, BRANCH_FACTOR*2 - 2)
  ])), text(BRANCH_FACTOR));
});

test('should return the correct element in a very large list', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
  var index = values.length >>> 1;
  var value = text(index);
  var list = fromArray(values);
  t.is(get(index, list), value);
});

test('should perform recomputation of accumulated slot sizes during traversal', t => {
  var list = appendArray(
    makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2),
    concatAll([listOf(1), listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1)])
  );
  var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
  t.is(get(index, list), text(index));
});

test('should release a reserved slot when refocusing a view for reading', t => {
  var list = appendArray(
    makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2),
    concatAll([listOf(1), listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1)])
  );
  list = prepend('X', list);
  t.true(list._right.slot.isReserved());
  t.true(list._left.slot.isReserved());
  get(BRANCH_FACTOR + (BRANCH_FACTOR >>> 1), list);
  t.false(list._right.slot.isReserved());
  t.true(list._left.slot.isReserved());
  t.is(list._right.slot, list._right.parent.slot.slots[list._right.slotIndex]);
});
