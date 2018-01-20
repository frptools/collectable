import test from 'ava';
import { unwrap } from '@frptools/structural';
import { from, setIn } from '../../src';

test('should set any keys defined in the path that are undefined on the target collection', t => {
  const emptyTarget = from({});
  const desiredValue = true;
  const nestedPath = ['a', 'b', 'c', 'd', 'e'];

  const actual = unwrap(setIn(nestedPath, desiredValue, emptyTarget));
  const expected = { a: { b: { c: { d: { e: true } } } } };
  t.deepEqual(actual, expected);
});

test('should overwrite existing values along the given path', t => {
  const target = from({ a: true });
  const desiredValue = true;
  const nestedPath = ['a', 'b', 'c', 'd', 'e'];

  const actual = unwrap(setIn(nestedPath, desiredValue, target));
  const expected = { a: { b: { c: { d: { e: true } } } } };
  t.deepEqual(actual, expected);
});

test('does not mutate the target collection', t => {
  const emptyTarget = from({});
  const desiredValue = true;
  const nestedPath = ['a', 'b', 'c', 'd', 'e'];

  setIn(nestedPath, desiredValue, emptyTarget);

  const actual = unwrap(emptyTarget);
  const expected = {};
  t.deepEqual(actual, expected);
});
