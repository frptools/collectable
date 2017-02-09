import {assert} from 'chai';
import {empty, fromArray, get, last, first, appendArray, prepend, concatAll} from '../../src';
import {BRANCH_FACTOR, listOf, makeValues, text} from '../test-utils';

suite('[List]', () => {
  suite('last()', () => {
    test('should return undefined if the list is empty', () => {
      var list = empty<any>();
      assert.isUndefined(last(list));
    });

    test('should return the last element in a list with multiple elements', () => {
      var list = fromArray<any>(['X', 'Y', 'Z']);
      assert.strictEqual(last(list), 'Z');
    });

    test('should return the only element in a single-element list', () => {
      var list = fromArray<any>(['X']);
      assert.strictEqual(last(list), 'X');
    });
  });

  suite('first()', () => {
    test('should return undefined if the list is empty', () => {
      var list = empty<any>();
      assert.isUndefined(first(list));
    });

    test('should return the first element in a list with multiple elements', () => {
      var list = fromArray<any>(['X', 'Y', 'Z']);
      assert.strictEqual(first(list), 'X');
    });

    test('should return the only element in a single-element list', () => {
      var list = fromArray<any>(['K']);
      assert.strictEqual(first(list), 'K');
    });
  });

  suite('get()', () => {
    test('should return undefined if the list is empty', () => {
      var list = empty<any>();
      assert.isUndefined(get(0, list));
    });

    test('should return undefined if the index is out of range', () => {
      var list = fromArray<any>(['X', 'Y', 'Z']);
      assert.isUndefined(get(3, list));
      assert.isUndefined(get(-4, list));
    });

    test('should return the element at each specified index', () => {
      var list = fromArray<any>(['X', 'Y', 'Z']);
      assert.strictEqual(get(2, list), 'Z');
      assert.strictEqual(get(1, list), 'Y');
      assert.strictEqual(get(0, list), 'X');
    });

    test('should treat negative numbers as offsets from the end of the list', () => {
      var list = fromArray<any>(['X', 'Y', 'Z']);
      assert.strictEqual(get(-1, list), 'Z');
      assert.strictEqual(get(-2, list), 'Y');
      assert.strictEqual(get(-3, list), 'X');
    });

    test('should return the correct element when it exists in the tail', () => {
      assert.strictEqual(get(0, listOf(2)), text(0));
      assert.strictEqual(get(BRANCH_FACTOR, listOf(BRANCH_FACTOR + 1)), text(BRANCH_FACTOR));
      assert.strictEqual(get(1056, listOf(1057)), text(1056));
    });

    test('should return the correct element when pathing through regular nodes', () => {
      assert.strictEqual(get(2, listOf(BRANCH_FACTOR + 1)), text(2));
      assert.strictEqual(get(BRANCH_FACTOR - 1, listOf(BRANCH_FACTOR)), text(BRANCH_FACTOR - 1));
      assert.strictEqual(get(2, listOf(BRANCH_FACTOR*BRANCH_FACTOR + BRANCH_FACTOR + 1)), text(2));
    });

    test('should return the correct element when pathing through relaxed nodes', () => {
      assert.strictEqual(get(1, concatAll([
        listOf(1),
        listOf(BRANCH_FACTOR, 1),
        listOf(1, BRANCH_FACTOR + 1)
      ])), text(1));
      assert.strictEqual(get(BRANCH_FACTOR, concatAll([
        listOf(BRANCH_FACTOR - 1),
        listOf(BRANCH_FACTOR - 1, BRANCH_FACTOR - 1),
        listOf(16, BRANCH_FACTOR*2 - 2)
      ])), text(BRANCH_FACTOR));
    });

    test('should return the correct element in a very large list', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      var index = values.length >>> 1;
      var value = text(index);
      var list = fromArray(values);
      assert.strictEqual(get(index, list), value);
    });

    test('should perform recomputation of accumulated slot sizes during traversal', () => {
      var list = appendArray(
        makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2),
        concatAll([listOf(1), listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1)])
      );
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      assert.strictEqual(get(index, list), text(index));
    });

    test('should release a reserved slot when refocusing a view for reading', () => {
      var list = appendArray(
        makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2),
        concatAll([listOf(1), listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1)])
      );
      list = prepend('X', list);
      assert.isTrue(list._right.slot.isReserved());
      assert.isTrue(list._left.slot.isReserved());
      get(BRANCH_FACTOR + (BRANCH_FACTOR >>> 1), list);
      assert.isFalse(list._right.slot.isReserved());
      assert.isTrue(list._left.slot.isReserved());
      assert.strictEqual(list._right.slot, list._right.parent.slot.slots[list._right.slotIndex]);
    });
  });
});
