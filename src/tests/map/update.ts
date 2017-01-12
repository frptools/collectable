import {assert} from 'chai';
import {emptyMap, asMutable, isMutable, update, set, toJS} from '../../collectable/map';

suite('Map', () => {
  suite('update()', () => {
    test('returns a new map with the specified key updated', () => {
      var map = set('x', 3, emptyMap<string, number>());

      var map1 = update('x', x => {
        assert.strictEqual(x, 3);
        return 2;
      }, map);

      var map2 = update('y', y => {
        assert.isUndefined(y);
        return 2;
      }, map);

      assert.isFalse(isMutable(map));
      assert.isFalse(isMutable(map1));
      assert.isFalse(isMutable(map2));
      assert.notStrictEqual(map, map1);
      assert.notStrictEqual(map, map2);
      assert.notStrictEqual(map1, map2);
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 2});
      assert.deepEqual(toJS(map2), {x: 3, y: 2});
    });

    test('returns the same map if the returned value is unchanged', () => {
      var map = set('x', 3, emptyMap<string, number>());
      var map1 = update('x', x => 3, map);
      var map2 = update('y', y => void 0, map);

      assert.isFalse(isMutable(map));
      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.notProperty(toJS(map), 'y');
      assert.deepEqual(toJS(map), {x: 3});
    });

    test('returns the same map if the original map is already mutable', () => {
      var map = asMutable(set('x', 3, emptyMap<string, number>()));

      assert.isTrue(isMutable(map));
      assert.deepEqual(toJS(map), {x: 3});

      var map1 = update('y', y => 2, map);

      assert.strictEqual(map, map1);
      assert.isTrue(isMutable(map1));
      assert.deepEqual(toJS(map1), {x: 3, y: 2});
    });
  });
});