import test from 'ava';
import { iterateFrom } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

var tree: RedBlackTreeStructure<number, string>;

test.beforeEach(() => {
  tree = createTree();
});

test('returns an empty iterator if the last key in the tree is less than or equal to the specified key', t => {
  const result = iterateFrom('gt', false, sortedValues[sortedValues.length - 1], tree);
  t.true(result.next().done);
});

test('[gt] [forward] iterates from the leftmost node that has a key that is greater than the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('gt', false, key, tree);
    if(i === sortedValues.length - 1) {
      t.true(it.next().done);
    }
    else {
      var results = Array.from(it).map(n => n.key);
      var expected = sortedValues.slice(i + 1);
      t.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

      // #2: check intermediate keys that do not exist in the tree
      key++;
      if(key !== expected[0]) {
        it = iterateFrom('gt', false, key, tree);
        results = Array.from(it).map(n => n.key);
        t.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
      }
    }
  }
});

test('[gt] [reverse] iterates from the leftmost node that has a key that is greater than the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('gt', true, key, tree);
    if(i === sortedValues.length - 1) {
      t.true(it.next().done);
    }
    else {
      var results = Array.from(it).map(n => n.key);
      var expected = sortedValues.slice(0, i + 2).reverse();
      t.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

      // #2: check intermediate keys that do not exist in the tree
      key++;
      if(key !== expected[0]) {
        it = iterateFrom('gt', true, key, tree);
        results = Array.from(it).map(n => n.key);
        t.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
      }
    }
  }
});

test('[gte] returns an empty iterator if the last key in the tree is less than the specified key', t => {
  const result = iterateFrom('gte', false, sortedValues[sortedValues.length - 1] + 1, tree);
  t.true(result.next().done);
});

test('[gte] [forward] iterates from the leftmost node that has a key that is greater than or equal to the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('gte', false, key, tree);
    var results = Array.from(it);
    var expected = sortedValues.slice(i);
    t.is(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
    t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

    // #2: check intermediate keys that do not exist in the tree
    key++;
    if(key !== expected[1]) {
      it = iterateFrom('gte', false, key, tree);
      results = Array.from(it);
      t.deepEqual(results.map(n => n.key), expected.slice(1), `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
    }
  }
});

test('[gte] [reverse] iterates from the leftmost node that has a key that is greater than or equal to the specified key', t => {
  for(var i = 0; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('gte', true, key, tree);
    var results = Array.from(it);
    var expected = sortedValues.slice(0, i + 1).reverse();
    t.is(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
    t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

    // #2: check intermediate keys that do not exist in the tree
    key++;
    if(key !== sortedValues[i + 1]) {
      it = iterateFrom('gte', true, key, tree);
      expected = key > sortedValues[sortedValues.length - 1] ? [] : sortedValues.slice(0, i + 2).reverse();
      results = Array.from(it);
      t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
    }
  }
});

test('[lt] returns an empty iterator if the first key in the tree is greater than or equal to the specified key', t => {
  const result = iterateFrom('lt', false, sortedValues[0], tree);
  t.true(result.next().done);
});

test('[lt] [forward] iterates from the rightmost node that has a key that is less than the specified key', t => {
  for(var i = 3; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('lt', false, key, tree);
    if(i === 0) {
      t.true(it.next().done);
    }
    else {
      var results = Array.from(it);
      var expected = sortedValues.slice(i - 1);
      t.is(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
      t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

      // #2: check intermediate keys that do not exist in the tree
      key--;
      if(key !== expected[0]) {
        it = iterateFrom('lt', false, key, tree);
        results = Array.from(it);
        t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
      }
    }
  }
});

test('[lt] [reverse] iterates from the rightmost node that has a key that is less than the specified key', t => {
  for(var i = 3; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('lt', true, key, tree);
    if(i === 0) {
      t.true(it.next().done);
    }
    else {
      var results = Array.from(it);
      var expected = sortedValues.slice(0, i).reverse();
      t.is(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
      t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

      // #2: check intermediate keys that do not exist in the tree
      key--;
      if(key !== expected[0]) {
        it = iterateFrom('lt', true, key, tree);
        results = Array.from(it);
        t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
      }
    }
  }
});

test('[lte] returns an empty iterator if the first key in the tree is greater than the specified key', t => {
  const result = iterateFrom('lte', false, sortedValues[0] - 1, tree);
  t.true(result.next().done);
});

test('[lte] [forward] iterates from the rightmost node that has a key that is less than or equal to the specified key', t => {
  for(var i = 3; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('lte', false, key, tree);
    var results = Array.from(it);
    var expected = sortedValues.slice(i);
    t.is(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
    t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

    // #2: check intermediate keys that do not exist in the tree
    key--;
    if(i === 0) {
      t.true(iterateFrom('lte', false, key, tree).next().done);
    }
    else if(key !== expected[0]) {
      expected.unshift(sortedValues[i - 1]);
      it = iterateFrom('lte', false, key, tree);
      results = Array.from(it);
      t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
    }
  }
});

test('[lte] [reverse] iterates from the rightmost node that has a key that is less than or equal to the specified key', t => {
  for(var i = 3; i < sortedValues.length; i++) {
    // #1: check keys known to exist in the tree
    var key = sortedValues[i];
    var it = iterateFrom('lte', true, key, tree);
    if(i === 0) {
      t.true(it.next().done);
    }
    else {
      var results = Array.from(it);
      var expected = sortedValues.slice(0, i + 1).reverse();
      t.is(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
      t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

      // #2: check intermediate keys that do not exist in the tree
      key--;
      if(i === 0) {
        t.true(iterateFrom('lte', true, key, tree).next().done);
      }
      else if(key !== expected[0]) {
        expected.shift();
        it = iterateFrom('lte', true, key, tree);
        results = Array.from(it);
        t.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
      }
    }
  }
});
