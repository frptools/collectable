import test from 'ava';
import { isImmutable, isMutable, modify } from '@collectable/core';
import { HashSetStructure, clone, fromArray, update } from '../../src';

let mutableSet: HashSetStructure<string>;
let immutableSet: HashSetStructure<string>;
test.before(() => {
  mutableSet = modify(fromArray(['A', 'B', 'C']));
  immutableSet = fromArray(['A', 'B', 'C']);
});

test('[mutable] the input set is passed to the predicate', t => {
  let called = false;
  update(s => {
    called = true;
    t.is(s, mutableSet);
  }, mutableSet);
  t.true(called);
});

test('[mutable] returns the input set if nothing is returned from the predicate', t => {
  const result = update(s => {}, mutableSet);
  t.is(result, mutableSet);
});

test('[mutable] returns the return value of the predicate, if defined', t => {
  const result = update(s => clone(s), mutableSet);
  t.not(result, mutableSet);
});

test('[mutable] if the input set is returned, it is still mutable', t => {
  const result = update(s => s, mutableSet);
  t.true(isMutable(result));
});

test('[immutable] a mutable clone of the input set is passed to the predicate', t => {
  let called = false;
  update(s => {
    called = true;
    t.not(s, immutableSet);
    t.deepEqual(Array.from(s).sort(), Array.from(immutableSet).sort());
  }, immutableSet);
  t.true(called);
});

test('[immutable] the mutable set argument is made immutable and returned, if the predicate returns nothing', t => {
  var inner: HashSetStructure<string> = <any>void 0;
  const result = update(s => {
    t.true(isMutable(s));
    inner = s;
  }, immutableSet);
  t.is(result, inner);
  t.true(isImmutable(result));
});

test('[immutable] if the predicate returns a set instance other than the original argument, an immutable clone of it is returned', t => {
  const result = update(s => {
    return modify(fromArray(['X', 'Y']));
  }, immutableSet);
  t.true(isImmutable(result));
  t.deepEqual(Array.from(result).sort(), ['X', 'Y']);
});
