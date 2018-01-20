import test from 'ava';
import { isImmutable } from '@collectable/core';
import { fromIterable, isEmpty, size } from '../src';

const pairs: [string, string][] = [['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd'], ['E', 'e']];

let it: IterableIterator<[string, string]>;
test.beforeEach(() => {
  it = new Map(pairs).entries();
});

test('returns an empty set if the iterable is empty', t => {
  t.true(isEmpty(fromIterable(new Map().values())));
});

test('returns a set containing each unique item emitted by the iterable', t => {
  t.deepEqual(Array.from(fromIterable(it)).sort(), pairs);
});

test('the returned set has size equal to the number of unique items emitted by the iterable', t => {
  t.is(size(fromIterable(it)), pairs.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromIterable(it)));
});
