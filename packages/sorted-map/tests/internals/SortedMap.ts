import {assert} from 'chai';
import {toArray} from '../../src';
import {SortedMap, fromStringArray} from '../test-utils';

suite('[SortedMap]', () => {
  let map: SortedMap, values = ['A', 'B', 'C', 'D', 'E'];
  suite('[SortedMapInternal]', () => {
    setup(() => {
      map = fromStringArray(values);
    });

    suite('#Symbol.iterator()', () => {
      test('emits the same values as the toArray() function', () => {
        assert.deepEqual(Array.from(map[Symbol.iterator]()), toArray(map));
      });
    });
  });
});