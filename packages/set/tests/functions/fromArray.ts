import test from 'ava';
import { isImmutable } from '@collectable/core';
import { fromArray, isEmpty, size } from '../../src';

const values = ['A', 'B', 'C', 'D', 'E'];

test('returns an empty set if the array is empty', t => {
  t.true(isEmpty(fromArray([])));
});

test('returns a set containing each unique item in the array', t => {
  t.deepEqual(Array.from(fromArray(values)).sort(), values);
});

test('the returned set has size equal to the number of unique items in the array', t => {
  t.is(size(fromArray(values)), values.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromArray(values)));
});
