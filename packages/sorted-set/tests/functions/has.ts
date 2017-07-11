import {assert} from 'chai';
import {SortedSetStructure, has} from '../../src';
import {fromStringArray} from '../test-utils';

suite('[SortedSet]', () => {
  suite('has()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    let set: SortedSetStructure<string>;
    suiteSetup(() => {
      set = fromStringArray(values);
    });

    test('returns true if the set contains the input item', () => {
      values.forEach(c => assert.isTrue(has(c, set)));
    });

    test('returns false if the set does not contain the input item', () => {
      assert.isFalse(has('a', set));
    });
  });
});