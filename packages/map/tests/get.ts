import {curry2} from '@typed/curry';
import {assert} from 'chai';
import {empty, isThawed, get, set, unwrap} from '../src';

const toJS = curry2(unwrap)(false);

suite('Map', () => {
  suite('get()', () => {
    test('returns the value with the specified key', () => {
      var map = set('x', 3, empty<string, number>());

      assert.strictEqual(get('x', map), 3);

      assert.isFalse(isThawed(map));
      assert.deepEqual(toJS(map), {x: 3});
    });

    test('returns undefined if the specified key is missing', () => {
      var map = set('x', 3, empty<string, number>());

      assert.isUndefined(get('y', map));

      assert.isFalse(isThawed(map));
      assert.deepEqual(toJS(map), {x: 3});
    });
  });
});