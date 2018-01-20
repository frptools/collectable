import test from 'ava';
import { isImmutable, isMutable, modify } from '@collectable/core';
import { HashSetStructure, filter, fromArray, has, size } from '../../src';

let setA: HashSetStructure<number>, setB: HashSetStructure<number>;
let setC: HashSetStructure<number>, setD: HashSetStructure<number>;

let values0: number[],
    values1: number[],
    values2: number[];
const predicate1 = (n: number) => ((n >>> 1) << 1) !== n;
const predicate2 = (n: number) => ((n >>> 1) << 1) === n;
test.before(() => {
  values0 = [1, 2, 3, 5, 8, 13, 21, 34, 55];
  values1 = [1, 3, 5, 13, 21, 55];
  values2 = [2, 8, 34];
  setA = modify(fromArray(values0));
  setB = filter(predicate1, setA);
  setC = fromArray(values0);
  setD = filter(predicate1, setC);
});

const p = (a, b) => a - b;
test('items are considered excluded if the predicate returns a falsey value', t => {
  const set0 = fromArray(values0);
  const set1 = filter(predicate1, set0);
  t.deepEqual(Array.from(set1).sort(p), values1);
});

test('items are considered included if the predicate returns a truthy value', t => {
  const set0 = fromArray(values0);
  const set1 = filter(predicate2, set0);
  t.deepEqual(Array.from(set1).sort(p), values2);
});

test('[mutable] the input set is returned', t => {
  t.is(setA, setB);
});

test('[mutable] the input set is still mutable', t => {
  t.true(isMutable(setA));
});

test('[mutable] the set size is decreased by the number of items excluded by the filter', t => {
  t.is(size(setA), values1.length);
});

test('[mutable] the excluded items can no longer be retrieved from the set', t => {
  for(let k of values2) {
    t.false(has(k, setA));
  }
});

test('[mutable] items not excluded by the filter can still be retrieved from the set', t => {
  for(let k of values1) {
    t.true(has(k, setA));
  }
});

test('[immutable] the input set is not modified', t => {
  t.not(setC, setD);
  t.is(size(setC), values0.length);
  t.deepEqual(Array.from(setC).sort(p), values0);
  t.true(isImmutable(setC));
});

test('[immutable] a new immutable set is returned', t => {
  t.true(isImmutable(setD));
});

test('[immutable] the size of the new set equals that of the input set, minus the number of items excluded by the filter', t => {
  t.is(size(setD), values1.length);
});

test('[immutable] the new set contains only the items from the input set that were not excluded by the filter', t => {
  t.deepEqual(Array.from(setD).sort(p), values1);
});
