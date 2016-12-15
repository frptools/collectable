declare function require(moduleName: string): any;

import {assert} from 'chai';
import {List} from '../collectable/list';

import {BRANCH_FACTOR, listOf, commitToRoot, gatherLeafValues, makeValues, text} from './test-utils';

suite('[List: public]', () => {
  suite('.empty()', () => {
    test('should have size 0', () => {
      const list = List.empty<string>();
      assert.strictEqual(list.size, 0);
    });
  });

  suite('.of()', () => {
    test('should return an empty list if passed an empty array', () => {
      const list = List.of([]);
      assert.strictEqual(list.size, 0);
      assert.isTrue(list._state.left.isDefaultEmpty());
      assert.isTrue(list._state.right.isDefaultEmpty());
    });

    test('should return a list containing all the values in the array', () => {
      var values = makeValues(BRANCH_FACTOR >>> 1);
      assert.deepEqual(gatherLeafValues(List.of(values)), values);

      values = makeValues(BRANCH_FACTOR);
      assert.deepEqual(gatherLeafValues(List.of(values)), values);

      values = makeValues(BRANCH_FACTOR + 1);
      var list = List.of(values);
      commitToRoot(list);
      assert.deepEqual(gatherLeafValues(list), values);

      values = makeValues(BRANCH_FACTOR*BRANCH_FACTOR);
      list = List.of(values);
      commitToRoot(list);
      assert.deepEqual(gatherLeafValues(list), values);
    });
  });

  suite('#append()', () => {
    test('should not mutate the original List', () => {
      const empty = List.empty<string>();
      const pushed = empty.append('foo');
      assert.strictEqual(empty.size, 0);
      assert.strictEqual(empty._state.left.slot.slots.length, 0);
      assert.notStrictEqual(empty, pushed);
      assert.notDeepEqual(empty, pushed);
    });

    test('should return the original list if called with no arguments', () => {
      const empty = List.empty<string>();
      const pushed = empty.append();
      assert.strictEqual(empty.size, 0);
      assert.strictEqual(empty, pushed);
    });

    test('should have size:1 after adding the first element', () => {
      const list = List.empty<string>().append('foo');
      assert.strictEqual(list.size, 1);
      assert.deepEqual(gatherLeafValues(list), ['foo']);
    });

    test('should have size:2 after adding the second element', () => {
      const list = List.empty<string>().append('foo').append('bar');
      assert.strictEqual(list.size, 2);
      assert.deepEqual(gatherLeafValues(list), ['foo', 'bar']);
    });

    test('should push each additional argument as an independent value', () => {
      var values = ['foo', 'bar', 'baz'];
      const list = List.empty<string>().append(...values);
      assert.strictEqual(list.size, 3);
      assert.deepEqual(gatherLeafValues(list), values);
    });
  });

  suite('#prepend()', () => {
    test('should not mutate the original List', () => {
      const empty = List.empty<string>();
      const pushed = empty.prepend('foo');
      assert.strictEqual(empty.size, 0);
      assert.strictEqual(empty._state.left.slot.slots.length, 0);
      assert.notStrictEqual(empty, pushed);
      assert.notDeepEqual(empty, pushed);
    });

    test('should return the original list if called with no arguments', () => {
      const empty = List.empty<string>();
      const pushed = empty.prepend();
      assert.strictEqual(empty.size, 0);
      assert.strictEqual(empty, pushed);
    });

    test('should have size:1 after adding the first element', () => {
      const list = List.empty<string>().prepend('foo');
      assert.strictEqual(list.size, 1);
      assert.deepEqual(gatherLeafValues(list), ['foo']);
    });

    test('should have size:2 after adding the second element', () => {
      const list = List.empty<string>().prepend('foo').prepend('bar');
      assert.strictEqual(list.size, 2);
      assert.deepEqual(gatherLeafValues(list), ['bar', 'foo']);
    });

    test('should push multiple arguments so that they appear in the order they were specified', () => {
      const list = List.of<string>(['test']).prepend('foo', 'bar', 'baz');
      assert.strictEqual(list.size, 4);
      assert.deepEqual(gatherLeafValues(list), ['foo', 'bar', 'baz', 'test']);
    });
  });

  suite('#pop()', () => {
    test('should return the same list if already empty', () => {
      var list = List.empty<any>();
      assert.strictEqual(list, list.pop());
    });

    test('should return a list that excludes the last element of the input list', () => {
      var list = List.of<any>(['X', 'Y', 'Z']).pop();
      assert.strictEqual(list.size, 2);
      assert.strictEqual(list.get(0), 'X');
      assert.strictEqual(list.get(1), 'Y');
    });

    test('should return an empty list if the input list contains only one element', () => {
      var list = List.of<any>(['X']).pop();
      assert.strictEqual(list.size, 0);
    });
  });

  suite('#popFront()', () => {
    test('should return the same list if already empty', () => {
      var list = List.empty<any>();
      assert.strictEqual(list, list.popFront());
    });

    test('should return a list that excludes the last element of the input list', () => {
      var list = List.of<any>(['X', 'Y', 'Z']).popFront();
      assert.strictEqual(list.size, 2);
      assert.strictEqual(list.get(0), 'Y');
      assert.strictEqual(list.get(1), 'Z');
    });

    test('should return an empty list if the input list contains only one element', () => {
      var list = List.of<any>(['X']).popFront();
      assert.strictEqual(list.size, 0);
    });
  });

  suite('#skip()', () => {
    test('should return the same list if already empty', () => {
      var list = List.empty<any>();
      assert.strictEqual(list, list.skip(2));
    });

    test('should return a list that excludes the specified number of elements from the left of the input list', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = List.of<any>(values).skip(2);
      assert.strictEqual(list.size, 4);
      assert.deepEqual(gatherLeafValues(list), values.slice(2));
    });

    test('should return an empty list if the input argument >= list.size', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = List.of<any>(values).skip(6);
      assert.strictEqual(list.size, 0);
    });

    test('should return the same list if the input argument === 0', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = List.of<any>(values);
      assert.strictEqual(list, list.skip(0));
    });
  });

  suite('#take()', () => {
    test('should return the same list if already empty', () => {
      var list = List.empty<any>();
      assert.strictEqual(list, list.take(4));
    });

    test('should return a list that excludes the specified number of elements from the left of the input list', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = List.of<any>(values).take(4);
      assert.strictEqual(list.size, 4);
      assert.deepEqual(gatherLeafValues(list), values.slice(0, 4));
    });

    test('should return an empty list if the input argument === 0', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = List.of<any>(values).take(0);
      assert.strictEqual(list.size, 0);
    });

    test('should return the same list if the input argument >= list.size', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list = List.of<any>(values);
      assert.strictEqual(list, list.take(values.length));
    });
  });

  suite('#get()', () => {
    test('should return undefined if the index is out of range', () => {
      var list = List.empty<string>();
      var listC = listOf(33);
      assert.strictEqual(list.get(0), void 0);
      assert.strictEqual(list.get(-50), void 0);
      assert.strictEqual(list.get(50), void 0);
      assert.strictEqual(listC.get(-50), void 0);
      assert.strictEqual(listC.get(50), void 0);
    });

    test('should return the correct element when it exists in the tail', () => {
      assert.strictEqual(listOf(2).get(0), text(0));
      assert.strictEqual(listOf(BRANCH_FACTOR + 1).get(BRANCH_FACTOR), text(BRANCH_FACTOR));
      assert.strictEqual(listOf(1057).get(1056), text(1056));
    });

    test('should return the correct element when pathing through regular nodes', () => {
      assert.strictEqual(listOf(BRANCH_FACTOR + 1).get(2), text(2));
      assert.strictEqual(listOf(BRANCH_FACTOR).get(BRANCH_FACTOR - 1), text(BRANCH_FACTOR - 1));
      assert.strictEqual(listOf(BRANCH_FACTOR*BRANCH_FACTOR + BRANCH_FACTOR + 1).get(2), text(2));
    });

    test('should return the correct element when pathing through relaxed nodes', () => {
      assert.strictEqual(listOf(1).concat(listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1)).get(1), text(1));
      assert.strictEqual(listOf(BRANCH_FACTOR - 1)
        .concat(listOf(BRANCH_FACTOR - 1, BRANCH_FACTOR - 1), listOf(16, BRANCH_FACTOR*2 - 2))
        .get(BRANCH_FACTOR), text(BRANCH_FACTOR));
    });

    test('should return the correct element in a very large list', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      var index = values.length >>> 1;
      var value = text(index);
      var list = List.of(values);
      assert.strictEqual(list.get(index), value);
    });

    test('should perform recomputation of accumulated slot sizes during traversal', () => {
      var list = listOf(1).concat(listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1))
                          .append(...makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2));
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      assert.strictEqual(list.get(index), text(index));
    });

    test('should release a reserved slot when refocusing a view for reading', () => {
      var list = listOf(1).concat(listOf(BRANCH_FACTOR, 1), listOf(1, BRANCH_FACTOR + 1))
                          .append(...makeValues(BRANCH_FACTOR*2 + 1, BRANCH_FACTOR + 2))
                          .prepend('X');
      assert.isTrue(list._state.right.slot.isReserved());
      assert.isTrue(list._state.left.slot.isReserved());
      list.get(BRANCH_FACTOR + (BRANCH_FACTOR >>> 1));
      assert.isFalse(list._state.right.slot.isReserved());
      assert.isTrue(list._state.left.slot.isReserved());
      assert.strictEqual(list._state.right.slot, list._state.right.xparent.slot.slots[list._state.right.xslotIndex]);
    });
  });

  suite('#set()', () => {
    test('throws an error if the index is out of range', () => {
      assert.throws(() => List.empty<any>().set(0, 'X'));
      assert.throws(() => List.of(['X', 'Y']).set(2, 'Z'));
      assert.throws(() => List.of(['X', 'Y']).set(-3, 'Z'));
    });

    test('updates the value at the specified index', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list1 = List.of<any>(values);
      var list2 = list1.set(0, 'J');
      list2 = list2.set(2, 'K');
      list2 = list2.set(5, 'L');
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), ['J', 'B', 'K', 'X', 'Y', 'L']);

      values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      var expected = values.slice();
      expected[0] = 'J';
      expected[BRANCH_FACTOR*2] = 'K';
      expected[expected.length - 1] = 'L';

      list1 = List.of<any>(values);
      list2 = list1.set(0, 'J');
      list2 = list2.set(BRANCH_FACTOR*2, 'K');
      list2 = list2.set(expected.length - 1, 'L');
      commitToRoot(list1);
      commitToRoot(list2);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), expected);

      list1 = List.of<any>(values);
      list2 = list1.set(expected.length - 1, 'L');
      list2 = list2.set(BRANCH_FACTOR*2, 'K');
      list2 = list2.set(0, 'J');
      commitToRoot(list1);
      commitToRoot(list2);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), expected);

      list1 = List.of<any>(values);
      list2 = list1.set(BRANCH_FACTOR*2, 'K');
      list2 = list2.set(expected.length - 1, 'L');
      list2 = list2.set(0, 'J');
      commitToRoot(list1);
      commitToRoot(list2);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), expected);
    });

    test('updates the value at a location relative to the end of the list if the specified index is negative', () => {
      var list1 = List.of<any>(['A', 'B', 'C', 'X', 'Y', 'Z']);
      var list2 = list1.set(-2, 'J');
      assert.deepEqual(gatherLeafValues(list1), ['A', 'B', 'C', 'X', 'Y', 'Z']);
      assert.deepEqual(gatherLeafValues(list2), ['A', 'B', 'C', 'X', 'J', 'Z']);
    });
  });

  suite('#insert()', () => {
    test('returns the same list if no arguments are provided', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list1 = List.of<any>(values);
      var list2 = list1.insert(0);
      assert.strictEqual(list1, list2);
      assert.deepEqual(gatherLeafValues(list2), values);
    });

    test('appends to the list when using index === list.size', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = List.of<any>(values);
      var list2 = list1.insert(list1.size, 'J', 'K');
      commitToRoot(list1);
      commitToRoot(list2);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), values.concat(['J', 'K']));
    });

    test('prepends to the list when using index 0', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = List.of<any>(values);
      var list2 = list1.insert(0, 'J', 'K');
      // commitToRoot(list1);
      commitToRoot(list2);
      // assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), ['J', 'K'].concat(values));
    });

    test('inserts the arguments in their respective order before the specified index', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = List.of<any>(values);
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      var list2 = list1.insert(index, 'J', 'K');
      commitToRoot(list1);
      commitToRoot(list2);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, index).concat(['J', 'K']).concat(values.slice(index)));
    });
  });

  suite('#insertArray()', () => {
    test('returns the same list if the value array is empty', () => {
      var values = ['A', 'B', 'C', 'X', 'Y', 'Z'];
      var list1 = List.of<any>(values);
      var list2 = list1.insertArray(0, []);
      assert.strictEqual(list1, list2);
      assert.deepEqual(gatherLeafValues(list2), values);
    });

    test('appends to the list when using index === list.size', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = List.of<any>(values);
      var list2 = list1.insertArray(list1.size, ['J', 'K']);
      commitToRoot(list1);
      commitToRoot(list2);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), values.concat(['J', 'K']));
    });

    test('prepends to the list when using index 0', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = List.of<any>(values);
      var list2 = list1.insertArray(0, ['J', 'K']);
      // commitToRoot(list1);
      commitToRoot(list2);
      // assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), ['J', 'K'].concat(values));
    });

    test('inserts the elements of the array in their respective order before the specified index', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      var list1 = List.of<any>(values);
      var index = BRANCH_FACTOR + (BRANCH_FACTOR >>> 1);
      var list2 = list1.insertArray(index, ['J', 'K']);
      commitToRoot(list1);
      commitToRoot(list2);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, index).concat(['J', 'K']).concat(values.slice(index)));
    });
  });

  suite('#delete()', () => {
    test('returns an identical list if the index is out of bounds', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = List.of(values);
      var list1 = list0.delete(values.length);
      var list2 = List.empty();
      var list3 = list2.delete(1);

      commitToRoot(list0);
      commitToRoot(list1);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length);
      assert.strictEqual(list2.size, 0);
      assert.strictEqual(list3.size, 0);
      assert.deepEqual(gatherLeafValues(list0), gatherLeafValues(list1));
      assert.deepEqual(gatherLeafValues(list2), gatherLeafValues(list3));
    });

    test('returns an empty list if the index points at the first element of a single-element list', () => {
      var list = List.of(['X']).delete(0);
      assert.strictEqual(list.size, 0);
      assert.deepEqual(gatherLeafValues(list), []);
    });

    test('removes the specified index when the list has only one node', () => {
      var values = makeValues(BRANCH_FACTOR - 1);
      var list0 = List.of(values);
      var list1 = list0.delete(0);
      var list2 = list0.delete(1);
      var list3 = list0.delete(BRANCH_FACTOR - 2);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length - 1);
      assert.strictEqual(list2.size, values.length - 1);
      assert.strictEqual(list3.size, values.length - 1);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values.slice(1));
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, 1).concat(values.slice(2)));
      assert.deepEqual(gatherLeafValues(list3), values.slice(0, values.length - 1));
    });

    test('removes the specified index when it is located at the head of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = List.of(values);
      var list1 = list0.delete(0);
      var list2 = list0.delete(BRANCH_FACTOR >>> 1);
      var list3 = list0.delete(BRANCH_FACTOR - 1);

      commitToRoot(list0);
      commitToRoot(list1);
      commitToRoot(list2);
      commitToRoot(list3);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length - 1);
      assert.strictEqual(list2.size, values.length - 1);
      assert.strictEqual(list3.size, values.length - 1);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values.slice(1));
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, BRANCH_FACTOR >>> 1).concat(values.slice((BRANCH_FACTOR >>> 1) + 1)));
      assert.deepEqual(gatherLeafValues(list3), values.slice(0, BRANCH_FACTOR - 1).concat(values.slice(BRANCH_FACTOR)));
    });

    test('removes the specified index when it is located at the tail of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = List.of(values);
      var list1 = list0.delete(values.length - 1);
      var list2 = list0.delete(values.length - (BRANCH_FACTOR >>> 1));
      var list3 = list0.delete(values.length - BRANCH_FACTOR);

      commitToRoot(list0);
      commitToRoot(list1);
      commitToRoot(list2);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length - 1);
      assert.strictEqual(list2.size, values.length - 1);
      assert.strictEqual(list3.size, values.length - 1);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values.slice(0, values.length - 1));
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, values.length - (BRANCH_FACTOR >>> 1)).concat(values.slice(values.length - (BRANCH_FACTOR >>> 1) + 1)));
      assert.deepEqual(gatherLeafValues(list3), values.slice(0, values.length - BRANCH_FACTOR).concat(values.slice(values.length - BRANCH_FACTOR + 1)));
    });

    test('removes the specified index when multi-level traversal would be required to find it', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      var list0 = List.of(values);
      var list1 = List.empty().prependArray(values);
      var list2 = list0.delete(BRANCH_FACTOR + 2);
      var list3 = list1.delete(list1.size - BRANCH_FACTOR - 2);

      commitToRoot(list0);
      commitToRoot(list1);
      commitToRoot(list2);
      commitToRoot(list3);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length);
      assert.strictEqual(list2.size, values.length - 1);
      assert.strictEqual(list3.size, values.length - 1);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values.slice(0, values.length));
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, BRANCH_FACTOR + 2).concat(values.slice(BRANCH_FACTOR + 3)));
      assert.deepEqual(gatherLeafValues(list3), values.slice(0, values.length - BRANCH_FACTOR - 2).concat(values.slice(values.length - BRANCH_FACTOR - 1)));
    });
  });

  suite('#deleteRange()', () => {
    test('returns an identical list if the index range is out of bounds', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = List.of(values);
      var list1 = list0.deleteRange(values.length, values.length + 2);
      var list2 = List.empty();
      var list3 = list2.deleteRange(1, 2);

      commitToRoot(list0);
      commitToRoot(list1);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length);
      assert.strictEqual(list2.size, 0);
      assert.strictEqual(list3.size, 0);
      assert.deepEqual(gatherLeafValues(list0), gatherLeafValues(list1));
      assert.deepEqual(gatherLeafValues(list2), gatherLeafValues(list3));
    });

    test('returns an empty list if the index range is a superset of the list', () => {
      var list0 = List.of(makeValues(BRANCH_FACTOR*3));
      var list1 = List.of(makeValues(BRANCH_FACTOR >>> 1));
      assert.strictEqual(list0.deleteRange(0, list0.size).size, 0);
      assert.strictEqual(list1.deleteRange(0, list1.size).size, 0);
    });

    test('removes the specified index range when the list has only one node', () => {
      var values = makeValues(BRANCH_FACTOR - 1);
      var list0 = List.of(values);
      var list1 = list0.deleteRange(0, 2);
      var list2 = list0.deleteRange(1, 3);
      var list3 = list0.deleteRange(values.length - 2, values.length);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length - 2);
      assert.strictEqual(list2.size, values.length - 2);
      assert.strictEqual(list3.size, values.length - 2);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values.slice(2));
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, 1).concat(values.slice(3)));
      assert.deepEqual(gatherLeafValues(list3), values.slice(0, values.length - 2));
    });

    test('removes the specified index range when contained within the head of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = List.of(values);
      var list1 = list0.deleteRange(0, 2);
      var list2 = list0.deleteRange(1, 3);
      var list3 = list0.deleteRange(BRANCH_FACTOR - 2, BRANCH_FACTOR);

      commitToRoot(list0);
      commitToRoot(list1);
      commitToRoot(list2);
      commitToRoot(list3);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length - 2);
      assert.strictEqual(list2.size, values.length - 2);
      assert.strictEqual(list3.size, values.length - 2);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values.slice(2));
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, 1).concat(values.slice(3)));
      assert.deepEqual(gatherLeafValues(list3), values.slice(0, BRANCH_FACTOR - 2).concat(values.slice(BRANCH_FACTOR)));
    });

    test('removes the specified index range when contained within the tail of the list', () => {
      var values = makeValues(BRANCH_FACTOR*3);
      var list0 = List.of(values);
      var list1 = list0.deleteRange(values.length - 2, values.length);
      var list2 = list0.deleteRange(values.length - (BRANCH_FACTOR >>> 1), values.length - (BRANCH_FACTOR >>> 1) + 2);
      var list3 = list0.deleteRange(values.length - BRANCH_FACTOR, values.length - BRANCH_FACTOR + 2);

      commitToRoot(list0);
      commitToRoot(list1);
      commitToRoot(list2);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length - 2);
      assert.strictEqual(list2.size, values.length - 2);
      assert.strictEqual(list3.size, values.length - 2);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values.slice(0, values.length - 2));
      assert.deepEqual(gatherLeafValues(list2), values.slice(0, values.length - (BRANCH_FACTOR >>> 1)).concat(values.slice(values.length - (BRANCH_FACTOR >>> 1) + 2)));
      assert.deepEqual(gatherLeafValues(list3), values.slice(0, values.length - BRANCH_FACTOR).concat(values.slice(values.length - BRANCH_FACTOR + 2)));
    });

    test('removes the specified index range when it spans multiple leaf nodes', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      var start = BRANCH_FACTOR + 2, end = BRANCH_FACTOR*2 + 2;
      var expected = values.slice(0, start).concat(values.slice(end));
      var list0 = List.of(values);
      var list1 = List.empty().prependArray(values);
      var list2 = list0.deleteRange(start, end);
      var list3 = list1.deleteRange(start, end);

      commitToRoot(list0);
      commitToRoot(list1);
      commitToRoot(list2);
      commitToRoot(list3);

      assert.strictEqual(list0.size, values.length);
      assert.strictEqual(list1.size, values.length);
      assert.strictEqual(list2.size, expected.length);
      assert.strictEqual(list3.size, expected.length);
      assert.deepEqual(gatherLeafValues(list0), values);
      assert.deepEqual(gatherLeafValues(list1), values);
      assert.deepEqual(gatherLeafValues(list2), expected);
      assert.deepEqual(gatherLeafValues(list3), expected);
    });
  });

  suite('#[Symbol.iterator]()', () => {
    test('returns an ES6-compliant iterator', () => {
      var it = List.empty()[Symbol.iterator]();
      assert.isFunction(it.next);
    });

    test('starts in a completed state if the list is empty', () => {
      var it = List.empty()[Symbol.iterator]();
      var current = it.next();
      assert.isTrue(current.done);
      assert.isUndefined(current.value);
    });

    test('iterates through all values sequentially', () => {
      var list = List.of(['X', 'Y']);
      assert.deepEqual(Array.from(<any>list), ['X', 'Y']);
    });

    test('is done when all values have been iterated over', () => {
      var list = List.of(['X', 'Y']);
      var it = list[Symbol.iterator]();
      assert.deepEqual(it.next(), {value: 'X', done: false});
      assert.deepEqual(it.next(), {value: 'Y', done: false});
      assert.deepEqual(it.next(), {value: void 0, done: true});
    });

    test('traverses multiple leaf nodes', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      var list = List.of(values);
      assert.deepEqual(Array.from(<any>list), values);
    });
  });

  suite('#toArray()', () => {
    test('returns an empty array if the list is empty', () => {
      assert.deepEqual(List.empty().toArray(), []);
    });

    test('returns an array of all values in a single-node list', () => {
      var list = List.of(['X', 'Y']);
      assert.deepEqual(list.toArray(), ['X', 'Y']);
    });

    test('returns an array of all values in a two-level list', () => {
      var values = makeValues(BRANCH_FACTOR*4);
      assert.deepEqual(List.of(values).toArray(), values);
    });

    test('returns an array of all values in a three-level list', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR);
      var list = List.of(values).set(BRANCH_FACTOR + 1, 'X');
      values[BRANCH_FACTOR + 1] = 'X';
      assert.deepEqual(list.toArray(), values);
    });

    test('returns an array of all values in a four-level list', () => {
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3) + BRANCH_FACTOR);
      var list = List.of(values).set(BRANCH_FACTOR + 1, 'X');
      values[BRANCH_FACTOR + 1] = 'X';
      assert.deepEqual(list.toArray(), values);
    });
  });
});


// suite.only('PERF', () => {
//   var values = makeValues(Math.pow(BRANCH_FACTOR, 4));
//   test(`speed`, function() {
//     this.timeout(30000);
//     var list = List.of(values);
//   });
//   test(`speed`, function() {
//     this.timeout(30000);
//     var list = List.empty<any>().appendArray(values);
//   });
//   test(`speed`, function() {
//     this.timeout(30000);
//     var list = List.empty<any>().prependArray(values);
//     console.log(list.size, list.get(500000));
//   });
//   test(`speed`, function() {
//     this.timeout(30000);
//     var list = List.empty<any>().asMutable();
//     for(var i = 0; i < 1000; i++) {
//       list.append(values[i]);
//     }
//     console.log(list.size, list.get(500));
//   });
// })