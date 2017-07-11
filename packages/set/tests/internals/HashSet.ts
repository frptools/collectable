import {assert} from 'chai';
import {HashSetStructure, fromArray, values} from '../../src';

suite('[HashSet]', () => {
  let set: HashSetStructure<string>;
  suite('[HashSetStructure]', () => {
    setup(() => {
      set = fromArray(['A', 'B', 'C', 'D', 'E']);
    });

    suite('#Symbol.iterator()', () => {
      test('emits the same values as the values() function', () => {
        assert.sameMembers(Array.from(set[Symbol.iterator]()), Array.from(values(set)));
      });
    });
  });
});