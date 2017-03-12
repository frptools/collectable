import {curry2} from '@typed/curry';
import {assert} from 'chai';
import {empty, isThawed, updateMap, set, unwrap} from '../src';

const toJS = curry2(unwrap)(false);

suite('[Map]', () => {
  suite('updateMap()', () => {
    // test('returns the same map if no changes are made', () => {
    //   var map = empty();
    //   var map1 = updateMap(m => {}, map);
    //   var map2 = updateMap(m => m, map);
    //   assert.strictEqual(map, map1);
    //   assert.strictEqual(map, map2);
    // });

    test('creates a mutable copy of the original map, then freezes and returns it', () => {
      var map = set('x', 3, empty());

      var map1a: any = void 0;
      var map1 = updateMap(m => {
        set('y', 5, m);
        set('z', 7, m);
        assert.isTrue(isThawed(m));
        map1a = m;
      }, map);

      var map2a: any = void 0;
      var map2 = updateMap(m => {
        var m1 = set('x', 9, m);
        var m2 = m = set('k', 1, m);
        assert.strictEqual(m, m1);
        assert.strictEqual(m, m2);
        map2a = m2;
        assert.isTrue(isThawed(m));
        return m2;
      }, map1);

      assert.notStrictEqual(map1, map1a);
      assert.notStrictEqual(map2, map2a);
      assert.isFalse(isThawed(map));
      assert.isFalse(isThawed(map1));
      assert.isFalse(isThawed(map2));
      assert.isTrue(isThawed(map1a));
      assert.isTrue(isThawed(map2a));
      assert.deepEqual(toJS(map), {x: 3});
      assert.deepEqual(toJS(map1), {x: 3, y: 5, z: 7});
      assert.deepEqual(toJS(map2), {x: 9, y: 5, z: 7, k: 1});
    });
  });
});