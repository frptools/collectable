import {assert} from 'chai';
import {empty, keys, entries, values} from '../../src';
import {fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  suite('keys()', () => {
    test('returns an empty iterable if the input list is empty', () => {
      const set = empty();
      assert.isTrue(keys(set).next().done);
    });

    test('returns an iterable that emits each member of the input map and then completes', () => {
      const set = fromStringArray(['A', 'B', 'C']);
      assert.deepEqual(Array.from(keys(set)), ['A', 'B', 'C']);
    });
  });

  suite('values()', () => {
    test('returns an empty iterable if the input list is empty', () => {
      const set = empty();
      assert.isTrue(values(set).next().done);
    });

    test('returns an iterable that emits each member of the input map and then completes', () => {
      const set = fromStringArray(['A', 'B', 'C']);
      assert.deepEqual(Array.from(values(set)), pairsFrom(['A', 'B', 'C']).map(p => p[1]));
    });
  });

  suite('entries()', () => {
    test('returns an empty iterable if the input list is empty', () => {
      const set = empty();
      assert.isTrue(entries(set).next().done);
    });

    test('returns an iterable that emits each member of the input map and then completes', () => {
      const set = fromStringArray(['A', 'B', 'C']);
      assert.deepEqual(Array.from(entries(set)), pairsFrom(['A', 'B', 'C']));
    });
  });
});