import {unwrap, isMutable} from '@collectable/core';
import {assert} from 'chai';
import {empty, update, set} from '../src';

suite('[HashMap]', () => {
  suite('update()', () => {
    test('returns a new map with the specified key updated', () => {
      var map = set('x', 3, empty<string, number>());

      var map1 = update(x => {
        assert.strictEqual(x, 3);
        return 2;
      }, 'x', map);

      var map2 = update(y => {
        assert.isUndefined(y);
        return 2;
      }, 'y', map);

      assert.isFalse(isMutable(map));
      assert.isFalse(isMutable(map1));
      assert.isFalse(isMutable(map2));
      assert.notStrictEqual(map, map1);
      assert.notStrictEqual(map, map2);
      assert.notStrictEqual(map1, map2);
      assert.deepEqual(unwrap(map), {x: 3});
      assert.deepEqual(unwrap(map1), {x: 2});
      assert.deepEqual(unwrap(map2), {x: 3, y: 2});
    });

    test('returns the same map if the returned value is unchanged', () => {
      var map = set('x', 3, empty<string, number>());
      var map1 = update(x => 3, 'x', map);
      var map2 = update(y => void 0, 'y', map);

      assert.isFalse(isMutable(map));
      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.notProperty(unwrap(map), 'y');
      assert.deepEqual(unwrap(map), {x: 3});
    });

    test('returns the same map if the original map is already mutable', () => {
      var map = set('x', 3, empty<string, number>(true));

      assert.isTrue(isMutable(map));
      assert.deepEqual(unwrap(map), {x: 3});

      var map1 = update(y => 2, 'y', map);

      assert.strictEqual(map, map1);
      assert.isTrue(isMutable(map1));
      assert.deepEqual(unwrap(map1), {x: 3, y: 2});
    });
  });
});