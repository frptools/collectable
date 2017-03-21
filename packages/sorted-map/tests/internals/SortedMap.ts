import {assert} from 'chai';
import {toArray, unwrap, set} from '../../src';
import {SortedMap, fromStringArray} from '../test-utils';

suite('[SortedMap]', () => {
  let map: SortedMap, values = ['A', 'B', 'C', 'D', 'E'];
  suite('[SortedMapImpl]', () => {
    setup(() => {
      map = fromStringArray(values);
    });

    suite('#Symbol.iterator()', () => {
      test('emits the same values as the toArray() function', () => {
        assert.deepEqual(Array.from(map[Symbol.iterator]()), toArray(map));
      });
    });

    suite('#@@type', () => {
      test('is not indexable', () => {
        assert.isFalse(map['@@type'].indexable);
      });

      test('calls unwrap() correctly', () => {
        assert.deepEqual(map['@@type'].unwrap(map), unwrap(true, map));
      });

      test('calls equals() correctly', () => {
        const map2 = fromStringArray(values);
        const map3 = set('X', 'x', map2);
        assert.isTrue(map['@@type'].equals(map, map2));
        assert.isFalse(map['@@type'].equals(map, map3));
        assert.isFalse(map['@@type'].equals(map2, map3));
      });
    });
  });
});