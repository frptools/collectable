import test from 'ava';
import { toArray } from '../../src';
import { fromStringArray } from '../test-utils';

test('emits the same values as the toArray() function', t => {
  const values = ['A', 'B', 'C', 'D', 'E'];
  const map = fromStringArray(values);
  t.deepEqual(Array.from(map[Symbol.iterator]()), toArray(map));
});
