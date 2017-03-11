import {curry2} from '@typed/curry';
import {assert} from 'chai';
import {empty, isFrozen, thaw, freeze, set, unwrap} from '../src';

const toJS = curry2(unwrap)(false);

suite('Map', () => {
  suite('freeze()', () => {
    test('creates an immutable copy of a mutable map', () => {
      var map = thaw(set('x', 3, empty()));
      var map1 = freeze(map);

      assert.notStrictEqual(map, map1);
      assert.isFalse(isFrozen(map));
      assert.isTrue(isFrozen(map1));

      set('y', 2, map);
      set('z', 2, map1);

      assert.isFalse(isFrozen(map));
      assert.isTrue(isFrozen(map1));
      assert.deepEqual(toJS(map), {x: 3, y: 2});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('returns the same map if already mutable', () => {
      var map = thaw(set('x', 3, empty()));
      var map1 = freeze(map);
      var map2 = freeze(map1);

      assert.notStrictEqual(map, map1);
      assert.strictEqual(map1, map2);
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('operations performed on an immutable map return a new map', () => {
      var map = thaw(set('x', 3, empty()));
      set('y', 1, map);
      set('z', 2, map);

      var map1 = freeze(map);
      var map2 = set('z', 3, map1);

      assert.notStrictEqual(map, map1);
      assert.notStrictEqual(map, map2);
      assert.notStrictEqual(map1, map2);

      assert.deepEqual(toJS(map), {x: 3, y: 1, z: 2});
      assert.deepEqual(toJS(map1), {x: 3, y: 1, z: 2});
      assert.deepEqual(toJS(map2), {x: 3, y: 1, z: 3});
    });
  });
});