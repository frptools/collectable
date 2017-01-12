import {assert} from 'chai';
import {emptyMap, isMutable, get, set, toJS} from '../../collectable/map';

suite('Map', () => {
  suite('get()', () => {
    test('returns the value with the specified key', () => {
      var map = set('x', 3, emptyMap<string, number>());

      assert.strictEqual(get('x', map), 3);

      assert.isFalse(isMutable(map));
      assert.deepEqual(toJS(map), {x: 3});
    });

    test('returns undefined if the specified key is missing', () => {
      var map = set('x', 3, emptyMap<string, number>());

      assert.isUndefined(get('y', map));

      assert.isFalse(isMutable(map));
      assert.deepEqual(toJS(map), {x: 3});
    });
  });
});