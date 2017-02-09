import {assert} from 'chai';
import {empty, mapToArray, fromArray, unwrap, set} from '../../src';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

function setX(values: string[]): string[] {
  values = Array.from(values);
  values[BRANCH_FACTOR + 1] = 'X';
  return values;
}

const values1 = ['X', 'Y'];
const values2 = makeValues(BRANCH_FACTOR*4);
const values3 = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR);
const values3x = setX(values3);
const values4 = makeValues(Math.pow(BRANCH_FACTOR, 3) + BRANCH_FACTOR);
const values4x = setX(values4);

suite('[List]', () => {
  suite('mapToArray()', () => {
    function transform(value: string): string {
      return '#' + value;
    }

    test('returns an empty array if the list is empty', () => {
      assert.deepEqual(mapToArray(transform, empty()), []);
    });

    test('returns a mapped array of all values in a single-node list', () => {
      var list = fromArray(values1);
      assert.deepEqual(mapToArray(transform, list), values1.map(transform));
    });

    test('returns a mapped array of all values in a two-level list', () => {
      var values = values2;
      assert.deepEqual(mapToArray(transform, fromArray(values)), values.map(transform));
    });

    test('returns a mapped array of all values in a three-level list', () => {
      var list = set(BRANCH_FACTOR + 1, 'X', fromArray(values3));
      assert.deepEqual(mapToArray(transform, list), values3x.map(transform));
    });

    test('returns a mapped array of all values in a four-level list', () => {
      var list = set(BRANCH_FACTOR + 1, 'X', fromArray(values4));
      assert.deepEqual(mapToArray(transform, list), values4x.map(transform));
    });
  });

  suite('unwrap()', () => {
    test('returns an empty array if the list is empty', () => {
      assert.deepEqual(unwrap(false, empty()), []);
    });

    test('also unwraps1 embedded collections if deep == true', () => {
      var list = fromArray(['X', 'Y', fromArray([fromArray(['A']), 'B']), 'C']);
      assert.deepEqual(unwrap(true, list), ['X', 'Y', [['A'], 'B'], 'C']);
    });

    test('returns an array of all values in a single-node list', () => {
      var list = fromArray(values1);
      assert.deepEqual(unwrap(false, list), values1);
    });

    test('returns an array of all values in a two-level list', () => {
      assert.deepEqual(unwrap(false, fromArray(values2)), values2);
    });

    test('returns an array of all values in a three-level list', () => {
      var list = set(BRANCH_FACTOR + 1, 'X', fromArray(values3));
      assert.deepEqual(unwrap(false, list), values3x);
    });

    test('returns an array of all values in a four-level list', () => {
      var list = set(BRANCH_FACTOR + 1, 'X', fromArray(values4));
      assert.deepEqual(unwrap(false, list), values4x);
    });
  });
});