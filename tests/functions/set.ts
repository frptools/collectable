import {assert} from 'chai';
import {from, setIn, unwrap} from '../../src';

suite('[Main]', () => {
  suite('setIn()', () => {
    test('should set any keys defined in the path that are undefined on the target collection', () => {
      const emptyTarget = from({});
      const desiredValue = true;
      const nestedPath = ['a', 'b', 'c', 'd', 'e'];

      const actual = unwrap(setIn(nestedPath, desiredValue, emptyTarget));
      const expected = {a: {b: {c: {d: {e: true}}}}};
      assert.deepEqual(actual, expected);
    });

    test('should overwrite existing values along the given path', () => {
      const target = from({a: true});
      const desiredValue = true;
      const nestedPath = ['a', 'b', 'c', 'd', 'e'];

      const actual = unwrap(setIn(nestedPath, desiredValue, target));
      const expected = {a: {b: {c: {d: {e: true}}}}};
      assert.deepEqual(actual, expected);
    });

    test('does not mutate the target collection', () => {
      const emptyTarget = from({});
      const desiredValue = true;
      const nestedPath = ['a', 'b', 'c', 'd', 'e'];

      setIn(nestedPath, desiredValue, emptyTarget);

      const actual = unwrap(emptyTarget);
      const expected = {};
      assert.deepEqual(actual, expected);
    });
  });
});
