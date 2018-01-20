import test from 'ava';
import { fromArray } from '../../src';
import { Slot, arrayFrom, createList, getOtherView, sliceList } from '../../src/internals';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('slicing an empty list is a noop', t => {
  var list = createList<any>(true);

  sliceList(list, 0, 1);

  t.is(list._size, 0);
  t.true(list._left.isDefaultEmpty());
  t.true(list._right.isDefaultEmpty());
});

test('slicing a superset of a non-empty list is a noop', t => {
  var values = makeValues(BRANCH_FACTOR*2);
  var list = fromArray(values);

  sliceList(list, 0, values.length);

  t.is(list._size, values.length);
  t.deepEqual(arrayFrom(list), values);
});

test('slicing a zero-length subset of a list returns an empty list', t => {
  var values = makeValues(BRANCH_FACTOR*2);
  var list = fromArray(values);

  sliceList(list, 5, 5);

  t.is(list._size, 0);
});

test('slicing away the left side of the head slot leaves the head view in an uncommitted state', t => {
  var values = makeValues(BRANCH_FACTOR*2);
  var list = fromArray(values);

  sliceList(list, 2, values.length);

  t.is(list._size, values.length - 2);
  t.is(list._left.offset, 0);
  t.is(list._left.slot.size, BRANCH_FACTOR - 2);
  t.is(list._left.sizeDelta, -2);
  t.is(list._left.slotsDelta, -2);
  t.true(list._left.slot.isReserved());
  t.true((<Slot<any>>list._left.parent.slot.slots[list._left.slotIndex]).isReserved());
});

test('slicing away the right side of the tail slot leaves the tail view in an uncommitted state', t => {
  var values = makeValues(BRANCH_FACTOR*2);
  var list = fromArray(values);

  sliceList(list, 0, values.length - 2);

  t.is(list._size, values.length - 2);
  t.is(list._right.offset, 0);
  t.is(list._right.slot.size, BRANCH_FACTOR - 2);
  t.is(list._right.sizeDelta, -2);
  t.is(list._right.slotsDelta, -2);
  t.true(list._right.slot.isReserved());
  t.true((<Slot<any>>list._right.parent.slot.slots[list._right.slotIndex]).isReserved());
});

test('slicing away the ends of the head and tail slots leaves both respective views in uncommitted states', t => {
  var values = makeValues(BRANCH_FACTOR*2);
  var list = fromArray(values);

  sliceList(list, 2, values.length - 2);

  t.is(list._size, values.length - 4);
  t.is(list._left.offset, 0);
  t.is(list._left.slot.size, BRANCH_FACTOR - 2);
  t.is(list._left.sizeDelta, -2);
  t.is(list._left.slotsDelta, -2);
  t.true(list._left.slot.isReserved());
  t.true((<Slot<any>>list._left.parent.slot.slots[list._left.slotIndex]).isReserved());
  t.is(list._size, values.length - 4);
  t.is(list._right.offset, 0);
  t.is(list._right.slot.size, BRANCH_FACTOR - 2);
  t.is(list._right.sizeDelta, -2);
  t.is(list._right.slotsDelta, -2);
  t.true(list._right.slot.isReserved());
  t.true((<Slot<any>>list._right.parent.slot.slots[list._right.slotIndex]).isReserved());
});

test('a left slice that does not include the current root reduces the height of the tree', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
  var list = fromArray(values);
  var halfbf = BRANCH_FACTOR >>> 1;
  var end = BRANCH_FACTOR*halfbf + halfbf;

  t.false(list._left.parent.isRoot());
  t.false(list._right.parent.isRoot());

  sliceList(list, 2, end);

  t.is(list._size, end - 2);
  t.is(list._left.slot.size, BRANCH_FACTOR - 2);
  t.is(list._left.offset, 0);
  t.is(list._right.slot.size, halfbf);
  t.is(list._right.offset, 0);
  t.is(list._left.parent, list._right.parent);
  t.true(list._left.parent.isRoot());
  t.deepEqual(arrayFrom(list), values.slice(2, end));
});

test('a right slice that does not include the current root reduces the height of the tree', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
  var list = fromArray(values);
  var halfbf = BRANCH_FACTOR >>> 1;
  var start = values.length - BRANCH_FACTOR - halfbf;
  var end = values.length - 2;

  t.false(list._left.parent.isRoot());
  t.false(list._right.parent.isRoot());

  sliceList(list, start, end);

  t.is(list._size, end - start);
  t.is(list._left.slot.size, halfbf);
  t.is(list._left.offset, 0);
  t.is(list._right.slot.size, BRANCH_FACTOR - 2);
  t.is(list._right.offset, 0);
  t.is(list._left.parent, list._right.parent);
  t.true(list._left.parent.isRoot());
  t.deepEqual(arrayFrom(list), values.slice(start, end));
});

{
  const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
  const list = fromArray(values);
  const halfbf = BRANCH_FACTOR >>> 1;
  const start = BRANCH_FACTOR + 1;
  const end = start + halfbf;

  test(`slice(${start}, ${end}) of list[${values.length}]`, t => {
    sliceList(list, start, end);

    var view = list._left;
    if(view.isNone()) view = list._right;
    var other = getOtherView(list, view.anchor);
    t.is(list._size, halfbf);
    t.is(view.slot.size, halfbf);
    t.is(view.offset, 0);
    t.true(other.isNone());
    t.true(view.isRoot());
    t.deepEqual(arrayFrom(list), values.slice(start, end));
  });
}

{
  const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
  const list = fromArray(values);
  const halfbf = BRANCH_FACTOR >>> 1;
  const start = 0;
  const end = halfbf + 1;

  test(`slice(${start}, ${end}) of list[${values.length}]`, t => {
    sliceList(list, start, end);
    t.is(list._size, halfbf + 1);
    t.is(list._left.slot.size, halfbf + 1);
    t.is(list._left.offset, 0);
    t.true(list._left.isRoot());
    t.true(list._right.isNone());
    t.deepEqual(arrayFrom(list), values.slice(start, end));
  });
}

{
  const values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
  const list = fromArray(values);
  const start = 1;
  const end = BRANCH_FACTOR;

  test(`slice(${start}, ${end}) of list[${values.length}]`, t => {
    sliceList(list, start, end);

    t.is(list._size, BRANCH_FACTOR - 1);
    t.is(list._left.slot.size, BRANCH_FACTOR - 1);
    t.is(list._left.offset, 0);
    t.true(list._left.isRoot());
    t.true(list._right.isNone());
    t.deepEqual(arrayFrom(list), values.slice(start, end));
  });
}

{
  const values = makeValues(BRANCH_FACTOR*2);
  const list = fromArray(values);
  const start = BRANCH_FACTOR;
  const end = BRANCH_FACTOR + 1;

  test(`slice(${start}, ${end}) of list[${values.length}]`, t => {
    sliceList(list, start, end);

    t.is(list._size, 1);
    t.is(list._right.slot.size, 1);
    t.is(list._right.offset, 0);
    t.true(list._right.isRoot());
    t.true(list._left.isNone());
    t.deepEqual(arrayFrom(list), values.slice(start, end));
  });
}

test('a slice that is a subset of the tail node removes the rest of the tree', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR*2);
  var list = fromArray(values);
  var halfbf = BRANCH_FACTOR >>> 1;
  var start = values.length - halfbf;
  var end = values.length;

  sliceList(list, start, end);

  t.is(list._size, halfbf);
  t.is(list._right.slot.size, halfbf);
  t.is(list._right.offset, 0);
  t.true(list._left.isNone());
  t.true(list._right.isRoot());
  t.deepEqual(arrayFrom(list), values.slice(start, end));
});

test('a slice can occur between node boundaries', t => {
  var values = makeValues(Math.pow(BRANCH_FACTOR, 4) - Math.pow(BRANCH_FACTOR, 3)*2);
  var list = fromArray(values);
  var start = Math.pow(BRANCH_FACTOR, 3);
  var end = values.length - start;

  sliceList(list, start, end);

  t.is(list._size, end - start);
  t.is(list._left.offset, 0);
  t.is(list._left.slot.size, BRANCH_FACTOR);
  t.is(list._right.offset, 0);
  t.is(list._right.slot.size, BRANCH_FACTOR);
  t.deepEqual(arrayFrom(list), values.slice(start, end));
});