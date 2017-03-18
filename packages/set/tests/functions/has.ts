import {assert} from 'chai';
import {Set, has, fromArray} from '../../src';

suite('[Set]', () => {
  suite('has()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    let set: Set<string>;
    suiteSetup(() => {
      set = fromArray(values);
    });

    test('returns true if the set contains the input item', () => {
      values.forEach(c => assert.isTrue(has(c, set)));
    });

    test('returns false if the set does not contain the input item', () => {
      assert.isFalse(has('a', set));
    });
  });
});