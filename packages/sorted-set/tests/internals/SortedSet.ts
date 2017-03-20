import {assert} from 'chai';
import {SortedSet, values, unwrap, add} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  let set: SortedSet<string>;
  suite('[SortedSetImpl]', () => {
    setup(() => {
      set = fromStringArray(['A', 'B', 'C', 'D', 'E']);
    });

    suite('#Symbol.iterator()', () => {
      test('emits the same values as the values() function', () => {
        assert.deepEqual(Array.from(set[Symbol.iterator]()), Array.from(values(set)));
      });
    });

    suite('#@@type', () => {
      test('is not indexable', () => {
        assert.isFalse(set['@@type'].indexable);
      });

      test('calls unwrap() correctly', () => {
        assert.deepEqual(set['@@type'].unwrap(set), unwrap(true, set));
      });

      test('calls equals() correctly', () => {
        const set2 = fromStringArray(Array.from(set));
        const set3 = add('X', set2);
        assert.isTrue(set['@@type'].equals(set, set2));
        assert.isFalse(set['@@type'].equals(set, set3));
        assert.isFalse(set['@@type'].equals(set2, set3));
      });
    });
  });
});