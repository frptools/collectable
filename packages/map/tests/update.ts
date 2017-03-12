import {curry2} from '@typed/curry';
import {assert} from 'chai';
import {empty, thaw, isThawed, update, set, unwrap} from '../src';

const toJS = curry2(unwrap)(false);

suite('[Map]', () => {
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

      assert.isFalse(isThawed(map));
      assert.isFalse(isThawed(map1));
      assert.isFalse(isThawed(map2));
      assert.notStrictEqual(map, map1);
      assert.notStrictEqual(map, map2);
      assert.notStrictEqual(map1, map2);
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 2});
      assert.deepEqual(toJS(map2), {x: 3, y: 2});
    });

    test('returns the same map if the returned value is unchanged', () => {
      var map = set('x', 3, empty<string, number>());
      var map1 = update(x => 3, 'x', map);
      var map2 = update(y => void 0, 'y', map);

      assert.isFalse(isThawed(map));
      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.notProperty(toJS(map), 'y');
      assert.deepEqual(toJS(map), {x: 3});
    });

    test('returns the same map if the original map is already mutable', () => {
      var map = thaw(set('x', 3, empty<string, number>()));

      assert.isTrue(isThawed(map));
      assert.deepEqual(toJS(map), {x: 3});

      var map1 = update(y => 2, 'y', map);

      assert.strictEqual(map, map1);
      assert.isTrue(isThawed(map1));
      assert.deepEqual(toJS(map1), {x: 3, y: 2});
    });
  });
});