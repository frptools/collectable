import test from 'ava';
import { isImmutable, isMutable, modify } from '@collectable/core';
import { HashSetStructure, fromArray, map, size } from '../../src';

const toLower = (a: string) => a.toLowerCase();

const values = ['A', 'B', 'C', 'D', 'E'];
let mutableSet: HashSetStructure<string>;
let set0: HashSetStructure<string>, set1: HashSetStructure<string>;

test.beforeEach(() => {
  mutableSet = modify(fromArray(values));
  set0 = fromArray(values);
  set1 = map(toLower, set0);
});

test('[mutable] the input set is returned', t => {
  t.is(map(toLower, mutableSet), mutableSet);
});

test('[mutable] the input set is still mutable', t => {
  map(toLower, mutableSet);
  t.true(isMutable(mutableSet));
});

test('[mutable] the set size remains unchanged', t => {
  t.is(size(map(toLower, mutableSet)), values.length);
});

test('[mutable] the predicate is called for each member of the input set', t => {
  let each: string[] = [];
  map(c => (each.push(c), c), mutableSet);
  t.deepEqual(each.sort(), values);
});

test('[mutable] all members of the set are replaced by their transformed counterpart returned by the predicate', t => {
  t.deepEqual(Array.from(map(toLower, mutableSet)).sort(), values.map(toLower));
});

test('[immutable] the input set is not modified', t => {
  t.is(size(set0), values.length);
  t.true(isImmutable(set0));
  t.deepEqual(Array.from(set0).sort(), values);
});

test('[immutable] a new immutable set is returned', t => {
  t.true(isImmutable(set1));
  t.not(set0, set1);
});

test('[immutable] the size of the new set equals that of the input set', t => {
  t.is(size(set0), size(set1));
});

test('[immutable] the predicate is called for each member of the input set', t => {
  let each: string[] = [];
  map(c => (each.push(c), c), set0);
  t.deepEqual(each.sort(), values);
});

test('[immutable] the new set is populated by the predicate-transformed counterparts of each member of the input set', t => {
  t.deepEqual(Array.from(map(toLower, set1)).sort(), values.map(toLower));
});
