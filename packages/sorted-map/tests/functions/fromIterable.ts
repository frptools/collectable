import test from 'ava';
import { isImmutable } from '@collectable/core';
import { fromIterable, isEmpty, size } from '../../src';
import { pairsFrom } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];
let it: IterableIterator<[string, number]>;
test.beforeEach(() => {
  it = new Map(pairsFrom(values)).entries();
});

test('returns an empty map if the iterable is empty', t => {
  t.true(isEmpty(fromIterable(new Set().values())));
});

test('returns a map containing each unique item emitted by the iterable', t => {
  t.deepEqual(Array.from(fromIterable(it)), pairsFrom(values));
});

test('the returned set has size equal to the number of unique items emitted by the iterable', t => {
  t.is(size(fromIterable(it)), values.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromIterable(it)));
});
