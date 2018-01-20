import test from 'ava';
import { unwrap } from '@collectable/core';
import { fromArray } from '../../src';

test('unwraps embedded collections', t => {
  var list = fromArray(['X', 'Y', fromArray([fromArray(['A']), 'B']), 'C']);
  t.deepEqual(unwrap(list), ['X', 'Y', [['A'], 'B'], 'C']);
});
