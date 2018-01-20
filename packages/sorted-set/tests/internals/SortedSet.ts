import test from 'ava';
import { values } from '../../src';
import { fromStringArray } from '../test-utils';

test('Symbol.iterator() emits the same values as the values() function', t => {
  const set = fromStringArray(['A', 'B', 'C', 'D', 'E']);
  t.deepEqual(Array.from(set[Symbol.iterator]()), Array.from(values(set)));
});
