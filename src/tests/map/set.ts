import {assert} from 'chai';
import {emptyMap, asMutable, isMutable, has, set, toJS} from '../../collectable/map';

suite('Map', () => {
  suite('set()', () => {
    test('returns a new map is the original map is immutable', () => {
      var map = set('x', 3, emptyMap<string, number>());
      var map1 = set('y', 2, map);

      assert.notStrictEqual(map, map1);
    });

    test('returns the same map is the original map is mutable', () => {
      var map = asMutable(set('x', 3, emptyMap<string, number>()));
      var map1 = set('y', 2, map);

      assert.strictEqual(map, map1);
    });

    test('assigns the specified value to a new map each time it is called on an immutable map', () => {
      var map = emptyMap<string, number>();
      var map1 = set('x', 3, map);
      var map2 = set('y', 2, map1);
      var map3 = set('x', 1, map2);

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

      assert.deepEqual(toJS(map), {});
      assert.deepEqual(toJS(map1), {x: 3});
      assert.deepEqual(toJS(map2), {x: 3, y: 2});
      assert.deepEqual(toJS(map3), {x: 1, y: 2});
    });

    test('assigns the specified value to the same map each time it is called on a mutable map', () => {
      var map = asMutable(emptyMap<string, number>());
      var map1 = set('x', 3, map);
      var map2 = set('y', 2, map1);
      var map3 = set('x', 1, map2);

      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.strictEqual(map, map3);
      assert.isTrue(isMutable(map));
      assert.deepEqual(toJS(map), {x: 1, y: 2});
    });

    test('returns the same map if the specified value is unchanged', () => {
      var map = set('y', 2, set('x', 3, emptyMap<string, number>()));

      assert.deepEqual(toJS(map), {x: 3, y: 2});

      var map1 = set('x', 4, map);
      var map2 = set('x', 4, map1);

      assert.notStrictEqual(map, map1);
      assert.strictEqual(map1, map2);
    });

    test('removes the specified key if the value is undefined', () => {
      var map = set('y', 2, set('x', 3, emptyMap<string, number>()));

      assert.deepEqual(toJS(map), {x: 3, y: 2});

      var map1 = set('x', void 0, map);

      assert.notStrictEqual(map, map1);
      assert.isFalse(has('x', map1));
      assert.deepEqual(toJS(map), {x: 3, y: 2});
      assert.deepEqual(toJS(map1), {y: 2});
    });
  });
});