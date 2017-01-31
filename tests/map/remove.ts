import {assert} from 'chai';
import {emptyMap, asMutable, isMutable, updateMap, has, set, remove, toJS} from '../../src/map';

suite('Map', () => {
  suite('remove()', () => {
    test('returns a new map is the original map is immutable', () => {
      var map = set('x', 3, emptyMap<string, number>());
      var map1 = remove('x', map);

      assert.notStrictEqual(map, map1);
    });

    test('returns the same map is the original map is mutable', () => {
      var map = asMutable(set('x', 3, emptyMap<string, number>()));
      var map1 = remove('x', map);

      assert.strictEqual(map, map1);
    });

    test('removes the specified value from a new map each time it is called on an immutable map', () => {
      var map = updateMap(m => {
        set('x', 1, m);
        set('y', 3, m);
        set('z', 5, m);
      }, emptyMap<string, number>());

      var map1 = remove('x', map);
      var map2 = remove('y', map1);
      var map3 = remove('z', map1);

      assert.notStrictEqual(map, map1);
      assert.notStrictEqual(map, map2);
      assert.notStrictEqual(map, map3);
      assert.notStrictEqual(map1, map2);
      assert.notStrictEqual(map1, map3);
      assert.notStrictEqual(map2, map3);

      assert.isFalse(isMutable(map));
      assert.isFalse(isMutable(map1));
      assert.isFalse(isMutable(map2));
      assert.isFalse(isMutable(map3));

      assert.deepEqual(toJS(map), {x: 1, y: 3, z: 5});
      assert.deepEqual(toJS(map1), {y: 3, z: 5});
      assert.deepEqual(toJS(map2), {z: 5});
      assert.deepEqual(toJS(map3), {y: 3});
    });

    test('removes the specified value from the same map each time it is called on a mutable map', () => {
      var map = asMutable(updateMap(m => {
        set('x', 1, m);
        set('y', 3, m);
        set('z', 5, m);
      }, emptyMap<string, number>()));

      var map1 = remove('x', map);
      var map2 = remove('y', map1);

      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.isTrue(isMutable(map));
      assert.deepEqual(toJS(map), {z: 5});
    });

    test('returns the same map if the specified key is missing', () => {
      var map = set('y', 2, set('x', 3, emptyMap<string, number>()));
      var map1 = remove('z', map);

      assert.strictEqual(map, map1);
      assert.deepEqual(toJS(map), {x: 3, y: 2});
      assert.isFalse(has('z', map1));
    });
  });
});