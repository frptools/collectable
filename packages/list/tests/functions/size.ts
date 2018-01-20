import test from 'ava';
import { appendArray, empty, fromArray, size } from '../../src';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('returns 0 if the list is empty', t => {
  t.is(size(empty()), 0);
});

test('returns the size of a single-node list', t => {
  var list = fromArray(['X', 'Y']);
  t.is(size(list), 2);
});

test('returns the correct size of a list with uncommitted changes', t => {
  var values = makeValues(BRANCH_FACTOR*4);
  t.is(size(appendArray(['X', 'Y'], fromArray(values))), values.length + 2);
});