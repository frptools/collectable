import {assert} from 'chai';
import {fromStringKeys, fromObject, fromPairsWithStringKeys, size} from '../../src';
import {unwrap} from '@collectable/core';

suite('[RedBlackTree]', () => {
  suite('fromObject()', () => {
    test('returns a tree that matches the keys in the source object', () => {
      const source = {a: 1, b: 2, c: 3};
      const tree = fromObject<number>(source);
      assert.strictEqual(size(tree), 3);
      assert.deepEqual(unwrap(tree), source);
    });
  });

  suite('fromPairs()', () => {
    test('returns a tree that matches the pairs in the source array', () => {
      const source: [string, number][] = [['a', 1], ['b', 2], ['c', 3]];
      const tree = fromPairsWithStringKeys<number>(source);
      assert.strictEqual(size(tree), 3);
      assert.deepEqual(unwrap(tree), {a: 1, b: 2, c: 3});
    });
  });

  suite('fromKeys()', () => {
    test('returns a tree containing the keys in a source array', () => {
      const source = ['a', 'b', 'c'];
      const tree = fromStringKeys(source);
      assert.strictEqual(size(tree), 3);
      assert.deepEqual(unwrap(tree), {a: null, b: null, c: null});
    });
  });
});