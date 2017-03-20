import {assert} from 'chai';
import {SortedSet, map, size, thaw, isThawed, isFrozen} from '../../src';
import {fromStringArray} from '../test-utils';

const toLower = (a: string) => a.toLowerCase();

suite('[SortedSet]', () => {
  suite('map()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];

    suite('if the input set is mutable', () => {
      let set: SortedSet<string>;
      setup(() => {
        set = thaw(fromStringArray(values));
      });

      test('the input set is returned', () => {
        assert.strictEqual(map(toLower, set), set);
      });

      test('the input set is still mutable', () => {
        map(toLower, set);
        assert.isTrue(isThawed(set));
      });

      test('the set size remains unchanged', () => {
        assert.strictEqual(size(map(toLower, set)), values.length);
      });

      test('the predicate is called for each member of the input set', () => {
        let each: string[] = [];
        map(c => (each.push(c), c), set);
        assert.deepEqual(each, values);
      });

      test('all members of the set are replaced by their transformed counterpart returned by the predicate', () => {
        assert.deepEqual(Array.from(map(toLower, set)), values.map(toLower));
      });
    });

    suite('if the input set is immutable', () => {
      let set0: SortedSet<string>, set1: SortedSet<string>;
      setup(() => {
        set0 = fromStringArray(values);
        set1 = map(toLower, set0);
      });

      test('the input set is not modified', () => {
        assert.strictEqual(size(set0), values.length);
        assert.isTrue(isFrozen(set0));
        assert.deepEqual(Array.from(set0), values);
      });

      test('a new immutable set is returned', () => {
        assert.isTrue(isFrozen(set1));
        assert.notStrictEqual(set0, set1);
      });

      test('the size of the new set equals that of the input set', () => {
        assert.strictEqual(size(set0), size(set1));
      });

      test('the predicate is called for each member of the input set', () => {
        let each: string[] = [];
        map(c => (each.push(c), c), set0);
        assert.deepEqual(each, values);
      });

      test('the new set is populated by the predicate-transformed counterparts of each member of the input set', () => {
        assert.deepEqual(Array.from(map(toLower, set1)), values.map(toLower));
      });
    });
  });
});