import {unwrap, isMutable, modify} from '@collectable/core';
import {assert} from 'chai';
import {empty, set} from '../src';

suite('[HashMap]', () => {
  suite('modify()', () => {
    test('creates a mutable copy of the original map', () => {
      var map = set('x', 3, empty());

      assert.isFalse(isMutable(map));

      var map1 = modify(map);

      assert.notStrictEqual(map, map1);
      assert.isFalse(isMutable(map));
      assert.isTrue(isMutable(map1));
      assert.deepEqual(unwrap(map), {x: 3});
      assert.deepEqual(unwrap(map1), {x: 3});
    });

    test('returns the same map if already mutable', () => {
      var map = set('x', 3, empty());
      var map1 = modify(map);
      var map2 = modify(map1);

      assert.notStrictEqual(map, map1);
      assert.strictEqual(map1, map2);
      assert.deepEqual(unwrap(map), {x: 3});
      assert.deepEqual(unwrap(map1), {x: 3});
    });

    test('operations performed on a mutable map update and return the original map', () => {
      var map = modify(set('x', 3, empty()));
      var map1 = set('y', 1, map);
      var map2 = set('z', 2, map1);

      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.deepEqual(unwrap(map), {x: 3, y: 1, z: 2});
    });
  });
});