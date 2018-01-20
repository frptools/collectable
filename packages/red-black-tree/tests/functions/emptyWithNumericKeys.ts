import test from 'ava';
import { emptyWithNumericKeys, size } from '../../src';

test('returns a tree of size 0', t => {
  const tree = emptyWithNumericKeys<number>();
  t.is(size(tree), 0);
});
