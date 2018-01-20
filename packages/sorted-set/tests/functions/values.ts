import test from 'ava';
import { empty, values } from '../../src';
import { fromStringArray } from '../test-utils';

test('returns an empty iterable if the input list is empty', t => {
  const set = empty();
  t.true(values(set).next().done);
});

test('returns an iterable that emits each member of the input set and then completes', t => {
  const set = fromStringArray(['A', 'B', 'C']);
  t.deepEqual(Array.from(values(set)), ['A', 'B', 'C']);
});
