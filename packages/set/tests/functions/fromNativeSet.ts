import test from 'ava';
import { isImmutable } from '@collectable/core';
import { fromNativeSet, isEmpty, size } from '../../src';

const values = ['A', 'B', 'C', 'D', 'E'];

const nativeSet = new Set(values);

test('returns an empty set if the input set is empty', t => {
  t.true(isEmpty(fromNativeSet(new Set())));
});

test('returns a set containing the same items from the input set', t => {
  t.deepEqual(Array.from(fromNativeSet(nativeSet)).sort(), values);
});

test('the returned set has the same size as the input set', t => {
  t.is(size(fromNativeSet(nativeSet)), values.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromNativeSet(nativeSet)));
});
