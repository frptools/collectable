import {assert} from 'chai';
import {ListStructure, fromArray} from '../../src';
import {fold} from '../../src/internals';

suite('[Internals: fold]', () => {
  suite('fold()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    let list: ListStructure<string>;
    setup(() => {
      list = fromArray(values);
    });

    test('does not modify the input list', () => {
      assert.sameMembers(Array.from(list), values);
    });

    test('calls the predicate with an accumulator value, a list item and an iteration index, for each member of the input list', () => {
      let ii = 0, expected = 'X', remaining = values.slice();
      fold((s: string, c: string, i: number) => {
        assert.strictEqual(i, ii++);
        assert.strictEqual(remaining.shift(), c);
        assert.strictEqual(expected, s);
        s += c;
        expected = s;
        return s;
      }, expected, list);
      assert.strictEqual(remaining.length, 0);
    });

    test('returns the value returned by the last predicate call', () => {
      let expected = 'X';
      const result = fold((s: string, c: string, i: number) => {
        s += c;
        expected = s;
        return s;
      }, expected, list);
      assert.strictEqual(expected, result);
    });
  });
});