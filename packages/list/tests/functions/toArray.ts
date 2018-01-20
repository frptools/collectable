import test from 'ava';
import { empty, fromArray, set, toArray } from '../../src';
import { BRANCH_FACTOR, makeValues } from '../helpers';

function setX (values: string[]): string[] {
  values = Array.from(values);
  values[BRANCH_FACTOR + 1] = 'X';
  return values;
}

const values1 = ['X', 'Y'];
const values2 = makeValues(BRANCH_FACTOR*4);
const values3 = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR);
const values3x = setX(values3);
const values4 = makeValues(Math.pow(BRANCH_FACTOR, 3) + BRANCH_FACTOR);
const values4x = setX(values4);

test('returns an empty array if the list is empty', t => {
  t.deepEqual(toArray(empty()), []);
});

test('returns an array of all values in a single-node list', t => {
  var list = fromArray(values1);
  t.deepEqual(toArray(list), values1);
});

test('returns an array of all values in a two-level list', t => {
  t.deepEqual(toArray(fromArray(values2)), values2);
});

test('returns an array of all values in a three-level list', t => {
  var list = set(BRANCH_FACTOR + 1, 'X', fromArray(values3));
  t.deepEqual(toArray(list), values3x);
});

test('returns an array of all values in a four-level list', t => {
  var list = set(BRANCH_FACTOR + 1, 'X', fromArray(values4));
  t.deepEqual(toArray(list), values4x);
});
