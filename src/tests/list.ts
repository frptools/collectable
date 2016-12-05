declare function require(moduleName: string): any;

import {assert} from 'chai';
import {List} from '../collectable/list';
import {Slot} from '../collectable/list/slot';

import {
  BRANCH_FACTOR,
  listOf,
  commitToRoot,
  gatherLeafValues,
  slotValues,
  tailSize,
  // tailView,
  headSize,
  headSlot,
  rootSlot,
  makeValues,
  text
} from './test-utils';

suite('[List: public]', () => {
  // var empty: List<string>;
  // var listBF: List<string>;
  var listH1plus1: List<string>;
  var listH2plusBFplus1: List<string>;
  var listH3plusBFplus1: List<string>;
  var listH4plusBFplus1: List<string>;
  // var list70k: List<string>;
  // var list100k: List<string>;
  // var tailSize70k: number;

  suiteSetup(function() {
    // empty = List.empty<string>();
    // listBF = listOf(BRANCH_FACTOR);
    // listH1plus1 = listOf(BRANCH_FACTOR + 1);
    // listH2plusBFplus1 = listOf(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
    // listH3plusBFplus1 = listOf(Math.pow(BRANCH_FACTOR, 3) + BRANCH_FACTOR + 1);
    // listH4plusBFplus1 = listOf(Math.pow(BRANCH_FACTOR, 4) + BRANCH_FACTOR + 1);
    // list70k = listOf(70000);
    // list100k = listOf(100000);
    // tailSize70k = (<LNode<string>>list70k._tail).size;
  });

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
      assert.deepEqual(gatherLeafValues(list), values)
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
      assert.strictEqual(list._state.right.slot, list._state.right.parent.slot.slots[list._state.right.slotIndex]);
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