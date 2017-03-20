import {assert} from 'chai';
import {empty, values} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  suite('values()', () => {
    test('returns an empty iterable if the input list is empty', () => {
      const set = empty();
      assert.isTrue(values(set).next().done);
    });

    test('returns an iterable that emits each member of the input set and then completes', () => {
      const set = fromStringArray(['A', 'B', 'C']);
      assert.deepEqual(Array.from(values(set)), ['A', 'B', 'C']);
    });
  });
});