import {assert} from 'chai';
import {HashSetStructure, reduce, fromArray} from '../../src';

suite('[HashSet]', () => {
  suite('reduce()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    let set: HashSetStructure<string>;
    setup(() => {
      set = fromArray(values);
    });

    test('does not modify the input set', () => {
      assert.sameMembers(Array.from(set), values);
    });

    test('calls the predicate with an accumulator value, a set item and an iteration index, for each member of the input set', () => {
      let ii = 0, expected = 'X', remaining = new Set(values);
      reduce((s: string, c: string, i: number) => {
        assert.strictEqual(i, ii++);
        assert.isTrue(remaining.has(c));
        remaining.delete(c);
        assert.strictEqual(expected, s);
        s += c;
        expected = s;
        return s;
      }, expected, set);
      assert.strictEqual(remaining.size, 0);
    });

    test('returns the value returned by the last predicate call', () => {
      let expected = 'X';
      const result = reduce((s: string, c: string, i: number) => {
        s += c;
        expected = s;
        return s;
      }, expected, set);
      assert.strictEqual(expected, result);
    });
  });
});