import {assert} from 'chai';
import {HashSetStructure, isEqual, fromArray} from '../../src';

suite('[HashSet]', () => {
  suite('isEqual()', () => {
    const values0 = ['A', 'B', 'C', 'D', 'E'];
    const values2 = ['A', 'B', 'C', 'D'];
    const values3 = ['x', 'A', 'B', 'C', 'D', 'E'];
    let set0: HashSetStructure<string>,
        set1: HashSetStructure<string>,
        set2: HashSetStructure<string>,
        set3: HashSetStructure<string>;
    suiteSetup(() => {
      set0 = fromArray(values0);
      set1 = fromArray(values0.slice()); // ensure the implementation doesn't retain the same array internally
      set2 = fromArray(values2);
      set3 = fromArray(values3);
    });

    test('returns true if both inputs contain equivalent sets of items', () => {
      assert.isTrue(isEqual(set0, set1));
    });

    test('returns false if either input contains items that cannot be found in the other', () => {
      assert.isFalse(isEqual(set0, set2));
      assert.isFalse(isEqual(set1, set2));
      assert.isFalse(isEqual(set0, set3));
      assert.isFalse(isEqual(set1, set3));
      assert.isFalse(isEqual(set2, set3));
    });
  });
});