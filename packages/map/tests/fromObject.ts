import test from 'ava';
import { isImmutable } from '@collectable/core';
import { fromObject, isEmpty, size } from '../src';

const pairs: [string, string][] = [['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd'], ['E', 'e']];
const obj = pairs.reduce((o, [k, v]) => (o[k] = v, o), <any>{});

test('returns an empty set if the input set is empty', t => {
  t.true(isEmpty(fromObject({})));
});

test('returns a set containing the same items from the input set', t => {
  t.deepEqual(Array.from(fromObject(obj)).sort(), <any>pairs);
});

test('the returned set has the same size as the input set', t => {
  t.is(size(fromObject(obj)), pairs.length);
});

test('the returned set is frozen', t => {
  t.true(isImmutable(fromObject(obj)));
});
