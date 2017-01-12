import {assert} from 'chai';
import {emptyMap, isMutable, asMutable, asImmutable, set, toJS} from '../../collectable/map';

suite('Map', () => {
  suite('asImmutable()', () => {
    test('creates an immutable copy of a mutable map', () => {
      var map = asMutable(set('x', 3, emptyMap()));
      var map1 = asImmutable(map);

      assert.notStrictEqual(map, map1);
      assert.isTrue(isMutable(map));
      assert.isFalse(isMutable(map1));

      set('y', 2, map);
      set('z', 2, map1);

      assert.isTrue(isMutable(map));
      assert.isFalse(isMutable(map1));
      assert.deepEqual(toJS(map), {x: 3, y: 2});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('returns the same map if already mutable', () => {
      var map = asMutable(set('x', 3, emptyMap()));
      var map1 = asImmutable(map);
      var map2 = asImmutable(map1);

      assert.notStrictEqual(map, map1);
      assert.strictEqual(map1, map2);
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('operations performed on an immutable map return a new map', () => {
      var map = asMutable(set('x', 3, emptyMap()));
      set('y', 1, map);
      set('z', 2, map);

      var map1 = asImmutable(map);
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