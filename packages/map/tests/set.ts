import {curry2} from '@typed/curry';
import {assert} from 'chai';
import {empty, thaw, isThawed, has, set, unwrap} from '../src';

const toJS = curry2(unwrap)(false);

suite('[Map]', () => {
  suite('set()', () => {
    test('returns a new map if the original map is immutable', () => {
      var map = set('x', 3, empty<string, number>());
      var map1 = set('y', 2, map);

      assert.notStrictEqual(map, map1);
    });

    test('returns the same map if the original map is mutable', () => {
      var map = thaw(set('x', 3, empty<string, number>()));
      var map1 = set('y', 2, map);

      assert.strictEqual(map, map1);
    });

    test('assigns the specified value to a new map each time it is called on an immutable map', () => {
      var map = empty<string, number>();
      var map1 = set('x', 3, map);
      var map2 = set('y', 2, map1);
      var map3 = set('x', 1, map2);

      assert.notStrictEqual(map, map1);
      assert.notStrictEqual(map, map2);
      assert.notStrictEqual(map, map3);
      assert.notStrictEqual(map1, map2);
      assert.notStrictEqual(map1, map3);
      assert.notStrictEqual(map2, map3);

      assert.isFalse(isThawed(map));
      assert.isFalse(isThawed(map1));
      assert.isFalse(isThawed(map2));
      assert.isFalse(isThawed(map3));

      assert.deepEqual(toJS(map), {});
      assert.deepEqual(toJS(map1), {x: 3});
      assert.deepEqual(toJS(map2), {x: 3, y: 2});
      assert.deepEqual(toJS(map3), {x: 1, y: 2});
    });

    test('assigns the specified value to the same map each time it is called on a mutable map', () => {
      var map = thaw(empty<string, number>());
      var map1 = set('x', 3, map);
      var map2 = set('y', 2, map1);
      var map3 = set('x', 1, map2);

      assert.strictEqual(map, map1);
      assert.strictEqual(map, map2);
      assert.strictEqual(map, map3);
      assert.isTrue(isThawed(map));
      assert.deepEqual(toJS(map), {x: 1, y: 2});
    });

    test('returns the same map if the specified value is unchanged', () => {
      var map = set('y', 2, set('x', 3, empty<string, number>()));

      assert.deepEqual(toJS(map), {x: 3, y: 2});

      var map1 = set('x', 4, map);
      var map2 = set('x', 4, map1);

      assert.notStrictEqual(map, map1);
      assert.strictEqual(map1, map2);
    });

    test('removes the specified key if the value is undefined', () => {
      var map = set('y', 2, set('x', 3, empty<string, number>()));

      assert.deepEqual(toJS(map), {x: 3, y: 2});

      var map1 = set('x', void 0, map);

      assert.notStrictEqual(map, map1);
      assert.isFalse(has('x', map1));
      assert.deepEqual(toJS(map), {x: 3, y: 2});
      assert.deepEqual(toJS(map1), {y: 2});
    });

    test('adds many values to the same mutable map', () => {
      var values: [string, number][] = [];
      var map = thaw(empty<string, number>());
      for(var i = 0, c = 'a'.charCodeAt(0); i < 26; i++, c++) {
        var entry: [string, number] = [String.fromCharCode(c), i*2 + 1];
        values.push(entry);
        set(entry[0], entry[1], map);
        assert.sameDeepMembers(Array.from(map), values);
      }
    });

    test('adds many values to successive copies of an immutable map', () => {
      var values: [string, number][] = [];
      var map = empty<string, number>();
      for(var i = 0, c = 'a'.charCodeAt(0); i < 26; i++, c++) {
        var entry: [string, number] = [String.fromCharCode(c), i*2 + 1];
        values.push(entry);
        map = set(entry[0], entry[1], map);
        assert.sameDeepMembers(Array.from(map), values);
      }
    });
  });
});