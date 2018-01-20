import test from 'ava';
import { isImmutable } from '@collectable/core';
import { fromIterable, isEmpty, size } from '../../src';

const values = ['A', 'B', 'C', 'D', 'E'];

let it: IterableIterator<string>;
test.beforeEach(() => {
  it = new Set(values).values();
});

test('returns an empty set if the iterable is empty', t => {
  t.true(isEmpty(fromIterable(new Set().values())));
});

test('returns a set containing each unique item emitted by the iterable', t => {
  t.deepEqual(Array.from(fromIterable(it)).sort(), values);
});

test('the returned set has size equal to the number of unique items emitted by the iterable', t => {
  t.is(size(fromIterable(it)), values.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromIterable(it)));
});
