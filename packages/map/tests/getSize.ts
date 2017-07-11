import {assert} from 'chai';
import {empty, size, set, remove} from '../src';

suite('[HashMap]', () => {
  suite('size()', () => {
    test('returns 0 when the map empty', () => {
      assert.strictEqual(size(empty()), 0);
    });

    test('returns the correct size after adding entries', () => {
      var map1 = set('x', 1, empty());
      var map2 = set('x', 2, map1);
      var map3 = set('y', 1, map1);
      assert.strictEqual(size(map1), 1);
      assert.strictEqual(size(map2), 1);
      assert.strictEqual(size(map3), 2);
    });

    test('returns the correct size after removing entries', () => {
      var map = set('x', 1, empty());
      map = set('y', 3, map);
      map = set('z', 5, map);
      assert.strictEqual(size(map = remove('x', map)), 2);
      assert.strictEqual(size(map = remove('y', map)), 1);
      assert.strictEqual(size(remove('z', map)), 0);
    });
  });
});