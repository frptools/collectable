import {Mutation} from '@collectable/core';
import {unwrap} from '@collectable/core';
import {assert} from 'chai';
import {empty, get, set} from '../src';

suite('[HashMap]', () => {
  suite('get()', () => {
    test('returns the value with the specified key', () => {
      var map = set('x', 3, empty<string, number>());

      assert.strictEqual(get('x', map), 3);

      assert.isFalse(Mutation.isMutable(map));
      assert.deepEqual(unwrap(map), {x: 3});
    });

    test('returns undefined if the specified key is missing', () => {
      var map = set('x', 3, empty<string, number>());

      assert.isUndefined(get('y', map));

      assert.isFalse(Mutation.isMutable(map));
      assert.deepEqual(unwrap(map), {x: 3});
    });
  });
});