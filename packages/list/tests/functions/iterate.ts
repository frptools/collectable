import {assert} from 'chai';
import {empty, fromArray} from '../../src';
import {BRANCH_FACTOR, makeValues} from '../test-utils';

suite('[List]', () => {
  suite('[Symbol.iterator]()', () => {
    test('returns an ES6-compliant iterator', () => {
      var it = empty()[Symbol.iterator]();
      assert.isFunction(it.next);
    });

    test('starts in a completed state if the list is empty', () => {
      var it = empty()[Symbol.iterator]();
      var current = it.next();
      assert.isTrue(current.done);
      assert.isUndefined(current.value);
    });

    test('iterates through all values sequentially', () => {
      var list = fromArray(['X', 'Y']);
      assert.deepEqual(Array.from(<any>list), ['X', 'Y']);
    });

    test('is done when all values have been iterated over', () => {
      var list = fromArray(['X', 'Y']);
      var it = list[Symbol.iterator]();
      assert.deepEqual(it.next(), {value: 'X', done: false});
      assert.deepEqual(it.next(), {value: 'Y', done: false});
      assert.deepEqual(it.next(), {value: void 0, done: true});
    });

    test('traverses multiple leaf nodes', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      var list = fromArray(values);
      assert.deepEqual(Array.from(<any>list), values);
    });
  });
});