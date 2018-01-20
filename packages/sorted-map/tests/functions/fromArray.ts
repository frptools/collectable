import test from 'ava';
import { isImmutable } from '@collectable/core';
import { isEmpty, size } from '../../src';
import { fromStringArray, pairsFrom } from '../test-utils';

const values = ['A', 'B', 'C', 'D', 'E'];

test('returns an empty map if the array is empty', t => {
  t.true(isEmpty(fromStringArray([])));
});

test('returns a map containing each unique item in the array', t => {
  t.deepEqual(Array.from(fromStringArray(values)), pairsFrom(values));
});

test('the returned set has size equal to the number of unique items in the array', t => {
  t.is(size(fromStringArray(values)), values.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromStringArray(values)));
});
