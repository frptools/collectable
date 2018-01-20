import test from 'ava';
import { of } from '../../src';
import { getAtOrdinal } from '../../src/internals';

test('should return a list containing the value', t => {
  var list = of('A');
  t.is(getAtOrdinal(list, 0), 'A');
});