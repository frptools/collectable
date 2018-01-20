import test from 'ava';
import { empty as emptyMap } from '@collectable/map';
import { empty, isSet } from '../../src';

test('returns true if the argument is an instance of a Collectable.js Set class', t => {
  t.true(isSet(empty()));
});

test('returns false if the argument is not an instance of a Collectable.js Set class', t => {
  t.false(isSet(emptyMap()));
});
