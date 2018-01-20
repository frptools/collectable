import test from 'ava';
import { empty, values } from '../../src';
import { fromStringArray, pairsFrom } from '../test-utils';

test('returns an empty iterable if the input list is empty', t => {
  const map = empty();
  t.true(values(map).next().done);
});

test('returns an iterable that emits each member of the input map and then completes', t => {
  const map = fromStringArray(['A', 'B', 'C']);
  t.deepEqual(Array.from(values(map)), pairsFrom(['A', 'B', 'C']).map(p => p[1]));
});
