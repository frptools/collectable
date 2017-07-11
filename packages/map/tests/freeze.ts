import {assert} from 'chai';
import {modify, commit, unwrap} from '@collectable/core';
import {empty, set} from '../src';

suite('[HashMap]', () => {
  suite('commit()', () => {
    test('returns the same map if already mutable', () => {
      var map = modify(set('x', 3, empty()));
      commit(map);
      var map1 = commit(map);

      assert.strictEqual(map, map1);
      assert.deepEqual(unwrap(map), {x: 3});
    });

    test('operations performed on an immutable map return a new map', () => {
      var map = set('x', 3, empty(true));
      set('y', 1, map);
      set('z', 2, map);
      commit(map);
      var map1 = set('z', 3, map);

      assert.notStrictEqual(map, map1);
      assert.deepEqual(unwrap(map), {x: 3, y: 1, z: 2});
      assert.deepEqual(unwrap(map1), {x: 3, y: 1, z: 3});
    });
  });
});