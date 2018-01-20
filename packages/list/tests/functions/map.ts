import test from 'ava';
import { isImmutable, isMutable, modify } from '@collectable/core';
import { ListStructure, fromArray, map, size } from '../../src';

const toLower = (a: string) => a.toLowerCase();
const values = ['A', 'B', 'C', 'D', 'E'];

let mutableList: ListStructure<string>;
let immutableListA: ListStructure<string>, immutableListB: ListStructure<string>;
test.beforeEach(() => {
  immutableListA = fromArray(values);
  immutableListB = map(toLower, immutableListA);
  mutableList = modify(immutableListA);
});

test('[immutable] the input list is not modified', t => {
  t.is(size(immutableListA), values.length);
  t.true(isImmutable(immutableListA));
  t.deepEqual(Array.from(immutableListA).sort(), values);
});

test('[immutable] a new immutable list is returned', t => {
  t.true(isImmutable(immutableListB));
  t.not(immutableListA, immutableListB);
});

test('[immutable] the size of the new list equals that of the input list', t => {
  t.is(size(immutableListA), size(immutableListB));
});

test('[immutable] the predicate is called for each member of the input list', t => {
  let each: string[] = [];
  map(c => (each.push(c), c), immutableListA);
  t.deepEqual(each.sort(), values);
});

test('[immutable] the new list is populated by the predicate-transformed counterparts of each member of the input list', t => {
  t.deepEqual(Array.from(map(toLower, immutableListB)).sort(), values.map(toLower));
});

test('[mutable] the input list is returned', t => {
  t.is(map(toLower, mutableList), mutableList);
});

test('[mutable] the input list is still mutable', t => {
  map(toLower, mutableList);
  t.true(isMutable(mutableList));
});

test('[mutable] the list size remains unchanged', t => {
  t.is(size(map(toLower, mutableList)), values.length);
});

test('[mutable] the predicate is called for each member of the input list', t => {
  let each: string[] = [];
  map(c => (each.push(c), c), mutableList);
  t.deepEqual(each.sort(), values);
});

test('[mutable] all members of list set are replaced by their transformed counterpart returned by the predicate', t => {
  t.deepEqual(Array.from(map(toLower, mutableList)).sort(), values.map(toLower));
});
