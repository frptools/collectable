import test from 'ava';
import { empty, fromArray, values } from '../../src';

test('returns an empty iterable if the input list is empty', t => {
  const set = empty();
  t.true(values(set).next().done);
});

test('returns an iterable that emits each member of the input set and then completes', t => {
  const set = fromArray(['A', 'B', 'C']);
  t.deepEqual(Array.from(values(set)).sort(), ['A', 'B', 'C']);
});
