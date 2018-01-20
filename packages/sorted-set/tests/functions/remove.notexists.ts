import test from 'ava';
import { SortedSetStructure, has, remove, size } from '../../src';
import { fromStringArray } from '../test-utils';

let set0: SortedSetStructure<string>, set1: SortedSetStructure<string>;
test.beforeEach(() => {
  set0 = fromStringArray(['A', 'B', 'C']);
  set1 = remove('D', set0);
});

test('the set size does not change', t => {
  t.is(size(set1), 3);
});

test('the input set is returned unmodified', t => {
  t.is(set0, set1);
});

test('the item is still unretrievable from the set', t => {
  t.false(has('D', set1));
});
