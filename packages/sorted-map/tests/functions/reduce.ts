import {assert} from 'chai';
import {reduce} from '../../src';
import {SortedMap, fromStringArray, pairsFrom} from '../test-utils';

suite('[SortedMap]', () => {
  suite('reduce()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];
    let map: SortedMap;
    setup(() => {
      map = fromStringArray(values);
    });

    test('does not modify the input map', () => {
      assert.deepEqual(Array.from(map), pairsFrom(values));
    });

    test('calls the predicate with an accumulator value, a map item and an iteration index, for each member of the input map', () => {
      let ii = 0, expected = 'X', remaining = new Set(values);
      reduce((acc: string, v: string, k: string, i: number) => {
        assert.strictEqual(i, ii++);
        assert.isTrue(remaining.has(k));
        remaining.delete(k);
        assert.strictEqual(expected, acc);
        acc += k;
        expected = acc;
        return acc;
      }, expected, map);
      assert.strictEqual(remaining.size, 0);
    });

    test('returns the value returned by the last predicate call', () => {
      let expected = 'X';
      const result = reduce((s: string, c: string, i: number) => {
        s += c;
        expected = s;
        return s;
      }, expected, map);
      assert.strictEqual(expected, result);
    });
  });
});