import test from 'ava';
import { HashSetStructure, fromArray, has, remove, size } from '../../src';

let set0: HashSetStructure<string>, set1: HashSetStructure<string>;
test.before(() => {
  set0 = fromArray(['A', 'B', 'C']);
  set1 = remove('D', set0);
});

test('when the item does not exist in the set, the set size does not change', t => {
  t.is(size(set1), 3);
});

test('when the item does not exist in the set, the input set is returned unmodified', t => {
  t.is(set0, set1);
});

test('when the item does not exist in the set, the item is still unretrievable from the set', t => {
  t.false(has('D', set1));
});
