import test from 'ava';
import { isImmutable, isMutable, modify } from '@collectable/core';
import { HashSetStructure, add, clone, fromArray, remove, size } from '../../src';
import { extractMap } from '../../src/internals';

let setA: HashSetStructure<string>, setB: HashSetStructure<string>;
let setC: HashSetStructure<string>, setD: HashSetStructure<string>;

test.beforeEach(() => {
  setA = fromArray(['A', 'B', 'C']);
  setB = clone(setA);
  setC = modify(fromArray(['A', 'B', 'C']));
  setD = clone(setC);
});

test('[immutable] a new immutable set is returned', t => {
  t.not(setA, setB);
  t.true(isImmutable(setB));
});

test('[immutable] the new set has the same size as the input set', t => {
  t.is(size(setB), size(setA));
});

test('[immutable] the new set has all of the items in the input set', t => {
  t.deepEqual(Array.from(setA).sort(), Array.from(setB).sort());
});

test('[immutable] changes made to the new set do not affect the input set', t => {
  const set2 = add('E', remove('A', setB));
  t.deepEqual(Array.from(setB).sort(), ['A', 'B', 'C']);
  t.deepEqual(Array.from(set2).sort(), ['B', 'C', 'E']);
});

test('[mutable] a new mutable set is returned', t => {
  t.true(isMutable(setC));
  t.true(isMutable(setD));
  t.not(setC, setD);
  t.not(extractMap(setC), extractMap(setD));
});

test('[mutable] the new set has the same size as the input set', t => {
  t.is(size(setD), size(setC));
});

test('[mutable] the new set has all of the items in the input set', t => {
  t.deepEqual(Array.from(setC).sort(), Array.from(setD).sort());
});

test('[mutable] changes made to the new set do not affect the input set', t => {
  remove('A', setD);
  add('E', setD);
  t.deepEqual(Array.from(setC).sort(), ['A', 'B', 'C']);
  t.deepEqual(Array.from(setD).sort(), ['B', 'C', 'E']);
});
