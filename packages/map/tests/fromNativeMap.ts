import test from 'ava';
import { isImmutable } from '@collectable/core';
import { fromNativeMap, isEmpty, size } from '../src';

const pairs: [string, string][] = [['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd'], ['E', 'e']];

test('returns an empty set if the input set is empty', t => {
  t.true(isEmpty(fromNativeMap(new Map())));
});

test('returns a set containing the same items from the input set', t => {
  t.deepEqual(Array.from(fromNativeMap(new Map(pairs))).sort(), pairs);
});

test('the returned set has the same size as the input set', t => {
  t.is(size(fromNativeMap(new Map(pairs))), pairs.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromNativeMap(new Map(pairs))));
});
