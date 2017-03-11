import {curry2} from '@typed/curry';
import {assert} from 'chai';
import {empty, isThawed, thaw, set, unwrap} from '../src';

const toJS = curry2(unwrap)(false);

suite('Map', () => {
  suite('thaw()', () => {
    test('creates a mutable copy of the original map', () => {
      var map = set('x', 3, empty());

      assert.isFalse(isThawed(map));

      var map1 = thaw(map);

      assert.notStrictEqual(map, map1);
      assert.isFalse(isThawed(map));
      assert.isTrue(isThawed(map1));
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('returns the same map if already mutable', () => {
      var map = set('x', 3, empty());
      var map1 = thaw(map);
      var map2 = thaw(map1);

      assert.notStrictEqual(map, map1);
      assert.strictEqual(map1, map2);
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('operations performed on a mutable map update and return the original map', () => {
      var map = thaw(set('x', 3, empty()));
      var map1 = set('y', 1, map);
      var map2 = set('z', 2, map1);

      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.deepEqual(toJS(map), {x: 3, y: 1, z: 2});
    });
  });
});