import {assert} from 'chai';
import {empty, fromArray, values} from '../../src';

suite('[Set]', () => {
  suite('values()', () => {
    test('returns an empty iterable if the input list is empty', () => {
      const set = empty();
      assert.isTrue(values(set).next().done);
    });

    test('returns an iterable that emits each member of the input set and then completes', () => {
      const set = fromArray(['A', 'B', 'C']);
      assert.sameMembers(Array.from(values(set)), ['A', 'B', 'C']);
    });
  });
});