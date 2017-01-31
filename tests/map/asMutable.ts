import {assert} from 'chai';
import {emptyMap, isMutable, asMutable, set, toJS} from '../../src/map';

suite('Map', () => {
  suite('asMutable()', () => {
    test('creates a mutable copy of the original map', () => {
      var map = set('x', 3, emptyMap());

      assert.isFalse(isMutable(map));

      var map1 = asMutable(map);

      assert.notStrictEqual(map, map1);
      assert.isFalse(isMutable(map));
      assert.isTrue(isMutable(map1));
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('returns the same map if already mutable', () => {
      var map = set('x', 3, emptyMap());
      var map1 = asMutable(map);
      var map2 = asMutable(map1);

      assert.notStrictEqual(map, map1);
      assert.strictEqual(map1, map2);
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 3});
    });

    test('operations performed on a mutable map update and return the original map', () => {
      var map = asMutable(set('x', 3, emptyMap()));
      var map1 = set('y', 1, map);
      var map2 = set('z', 2, map1);

      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.deepEqual(toJS(map), {x: 3, y: 1, z: 2});
    });
  });
});