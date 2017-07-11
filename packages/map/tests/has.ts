import {assert} from 'chai';
import {empty, has, set, remove} from '../src';

suite('[HashMap]', () => {
  suite('has()', () => {
    test('returns true if the specified property exists', () => {
      var map = set('x', 3, empty<string, number>());
      assert.isTrue(has('x', map));
    });

    test('returns false if the specified property is missing', () => {
      var map = set('x', 3, empty<string, number>());
      assert.isFalse(has('y', map));
    });

    test('returns true after assigning a property to a mutable map', () => {
      var map = empty<string, number>(true);
      assert.isFalse(has('x', map));
      set('x', 3, map);
      assert.isTrue(has('x', map));
    });

    test('return false after removing a property from a mutable map', () => {
      var map = set('x', 3, empty<string, number>(true));
      assert.isTrue(has('x', map));
      remove('x', map);
      assert.isFalse(has('x', map));
    });
  });
});