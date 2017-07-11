import {assert} from 'chai';
import {SortedSetStructure, values} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  let set: SortedSetStructure<string>;
  suite('[SortedSetInternal]', () => {
    setup(() => {
      set = fromStringArray(['A', 'B', 'C', 'D', 'E']);
    });

    suite('#Symbol.iterator()', () => {
      test('emits the same values as the values() function', () => {
        assert.deepEqual(Array.from(set[Symbol.iterator]()), Array.from(values(set)));
      });
    });
  });
});