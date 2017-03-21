import {assert} from 'chai';
import {has} from '../../src';
import {SortedMap, fromStringArray} from '../test-utils';

suite('[SortedMap]', () => {
  suite('has()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    let map: SortedMap;
    suiteSetup(() => {
      map = fromStringArray(values);
    });

    test('returns true if the map contains the input item', () => {
      values.forEach(c => assert.isTrue(has(c, map)));
    });

    test('returns false if the map does not contain the input item', () => {
      assert.isFalse(has('a', map));
    });
  });
});