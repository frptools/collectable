import test from 'ava';
import { empty, fromArray } from '../../src';
import { BRANCH_FACTOR, makeValues } from '../helpers';

test('returns an ES6-compliant iterator', t => {
  var it = empty()[Symbol.iterator]();
  t.is(typeof it.next, 'function');
});

test('starts in a completed state if the list is empty', t => {
  var it = empty()[Symbol.iterator]();
  var current = it.next();
  t.true(current.done);
  t.is(current.value, void 0);
});

test('iterates through all values sequentially', t => {
  var list = fromArray(['X', 'Y']);
  t.deepEqual(Array.from(<any>list), ['X', 'Y']);
});

test('is done when all values have been iterated over', t => {
  var list = fromArray(['X', 'Y']);
  var it = list[Symbol.iterator]();
  t.deepEqual(it.next(), { value: 'X', done: false });
  t.deepEqual(it.next(), { value: 'Y', done: false });
  t.deepEqual(it.next(), { value: <any>void 0, done: true });
});

test('traverses multiple leaf nodes', t => {
  var values = makeValues(BRANCH_FACTOR*4);
  var list = fromArray(values);
  t.deepEqual(Array.from(<any>list), values);
});
