declare function require(moduleName: string): any;

import {assert} from 'chai';
import {ListState} from '../collectable/list/state';
import {append, prepend} from '../collectable/list/insertion';
import {getAtOrdinal} from '../collectable/list/traversal';
import {concat} from '../collectable/list/concat';

import {
  BRANCH_FACTOR,
  assertArrayElementsAreEqual,
  slotValues,
  gatherLeafValues,
  commitToRoot,
  tailSize,
  headSize,
  headSlot,
  tailSlot,
  rootSlot,
  makeValues
} from './test-utils';

// hN = enough nodes to create a tree of height N
// pN = plus N
// mN = minus N
// BF = number of nodes equivalent to the branch factor (generally 32)
// NxM = the value of N multipled by M
const values_BF = makeValues(BRANCH_FACTOR);
const values_BFx2_p1 = makeValues(BRANCH_FACTOR*2 + 1);
const values_BFxBF = makeValues(Math.pow(BRANCH_FACTOR, 2));
const values_BFxBFxBF = makeValues(Math.pow(BRANCH_FACTOR, 3));
const values_BFxBFxBFxBF = makeValues(Math.pow(BRANCH_FACTOR, 4));
const values_h2_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
const values_h3_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 3) + BRANCH_FACTOR + 1);
const values_h4_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 4) + BRANCH_FACTOR + 1);

function makeList(values: any[], initialSize: number, usePrepend: boolean): ListState<any> {
  const list = ListState.empty<any>(true);
  if(initialSize > 0) {
    append(list, values.slice(0, initialSize));
    commitToRoot(list);
    values = values.slice(initialSize);
  }
  if(usePrepend) {
    prepend(list, values);
  }
  else {
    append(list, values);
  }
  commitToRoot(list);
  return list;
}

suite('[List: capacity]', () => {
  suite('increaseCapacity()', () => {
    suite('can grow beyond the size of the default branching factor', () => {
      test('when appending', () => {
        const list = makeList(values_BFx2_p1, 1, false);
        assert.strictEqual(list.size, values_BFx2_p1.length);
        assert.deepEqual(slotValues(headSlot(list)), values_BFx2_p1.slice(0, BRANCH_FACTOR));
        assert.deepEqual(slotValues(tailSlot(list)), values_BFx2_p1.slice(BRANCH_FACTOR*2));
        assert.strictEqual(headSize(list), BRANCH_FACTOR);
        assert.strictEqual(tailSize(list), 1);
      });

      test('when prepending', () => {
        const list = makeList(values_BFx2_p1, 1, true);
        commitToRoot(list);
        assert.strictEqual(list.size, values_BFx2_p1.length);
        assert.deepEqual(gatherLeafValues(list), values_BFx2_p1.slice(1).concat(values_BFx2_p1.slice(0, 1)));
        assert.strictEqual(headSize(list), 1);
        assert.strictEqual(tailSize(list), BRANCH_FACTOR);
      });
    });

    suite('increases depth when the root is full', () => {
      test('when appending', function() {
        this.timeout(30000); // tslint:disable-line
        const listH2 = makeList(values_BFx2_p1, 1, false);
        const listH3 = makeList(values_h2_pBF_p1, 1, false);
        const listH4 = makeList(values_h3_pBF_p1, 1, false);
        const listH5 = makeList(values_h4_pBF_p1, 1, false);

        assert.strictEqual(listH2.size, values_BFx2_p1.length);
        assert.strictEqual(listH3.size, values_h2_pBF_p1.length);
        assert.strictEqual(listH4.size, values_h3_pBF_p1.length);
        assert.strictEqual(listH5.size, values_h4_pBF_p1.length);
        assertArrayElementsAreEqual(gatherLeafValues(listH2, true), values_BFx2_p1, 'listH2 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH3, true), values_h2_pBF_p1, 'listH3 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH4, true), values_h3_pBF_p1, 'listH4 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH5, true), values_h4_pBF_p1, 'listH5 values are not correct');

        commitToRoot(listH2);
        commitToRoot(listH3);
        commitToRoot(listH4);
        commitToRoot(listH5);
        assert.isAbove(rootSlot(listH2).group, 0, `root slot of listH2 should not be reserved`);
        assert.isAbove(rootSlot(listH3).group, 0, `root slot of listH2 should not be reserved`);
        assert.isAbove(rootSlot(listH4).group, 0, `root slot of listH2 should not be reserved`);
        assert.isAbove(rootSlot(listH5).group, 0, `root slot of listH2 should not be reserved`);
      });

      test('when prepending', function() {
        this.timeout(30000); // tslint:disable-line
        const listH2 = makeList(values_BFx2_p1, 1, true);
        const listH3 = makeList(values_h2_pBF_p1, 1, true);
        const listH4 = makeList(values_h3_pBF_p1, 1, true);
        const listH5 = makeList(values_h4_pBF_p1, 1, true);

        assert.strictEqual(listH2.size, values_BFx2_p1.length);
        assert.strictEqual(listH3.size, values_h2_pBF_p1.length);
        assert.strictEqual(listH4.size, values_h3_pBF_p1.length);
        assert.strictEqual(listH5.size, values_h4_pBF_p1.length);
        assertArrayElementsAreEqual(gatherLeafValues(listH2, true), values_BFx2_p1.slice(1).concat(values_BFx2_p1.slice(0, 1)), 'listH2 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH3, true), values_h2_pBF_p1.slice(1).concat(values_h2_pBF_p1.slice(0, 1)), 'listH3 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH4, true), values_h3_pBF_p1.slice(1).concat(values_h3_pBF_p1.slice(0, 1)), 'listH4 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH5, true), values_h4_pBF_p1.slice(1).concat(values_h4_pBF_p1.slice(0, 1)), 'listH5 values are not correct');

        commitToRoot(listH2);
        commitToRoot(listH3);
        commitToRoot(listH4);
        commitToRoot(listH5);
        assert.isAbove(rootSlot(listH2).group, 0, `root slot of listH2 should not be reserved`);
        assert.isAbove(rootSlot(listH3).group, 0, `root slot of listH2 should not be reserved`);
        assert.isAbove(rootSlot(listH4).group, 0, `root slot of listH2 should not be reserved`);
        assert.isAbove(rootSlot(listH5).group, 0, `root slot of listH2 should not be reserved`);
      });
    });

    suite(`grows correctly when the number of appended elements is perfectly divisible by the branch factor`, () => {
      test('when appending', function() {
        this.timeout(30000); // tslint:disable-line
        const listH2 = makeList(values_BF, 0, false);
        const listH3 = makeList(values_BFxBF, 0, false);
        const listH4 = makeList(values_BFxBFxBF, 0, false);
        const listH5 = makeList(values_BFxBFxBFxBF, 0, false);
        assert.strictEqual(listH2.size, values_BF.length);
        assert.strictEqual(listH3.size, values_BFxBF.length);
        assert.strictEqual(listH4.size, values_BFxBFxBF.length);
        assert.strictEqual(listH5.size, values_BFxBFxBFxBF.length);
        assertArrayElementsAreEqual(gatherLeafValues(listH2, true), values_BF, 'listH2 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH3, true), values_BFxBF, 'listH3 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH4, true), values_BFxBFxBF, 'listH4 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH5, true), values_BFxBFxBFxBF, 'listH5 values are not correct');
      });

      test('when prepending', function() {
        this.timeout(30000); // tslint:disable-line
        const listH2 = makeList(values_BF, 0, true);
        const listH3 = makeList(values_BFxBF, 0, true);
        const listH4 = makeList(values_BFxBFxBF, 0, true);
        const listH5 = makeList(values_BFxBFxBFxBF, 0, true);
        assert.strictEqual(listH2.size, values_BF.length);
        assert.strictEqual(listH3.size, values_BFxBF.length);
        assert.strictEqual(listH4.size, values_BFxBFxBF.length);
        assert.strictEqual(listH5.size, values_BFxBFxBFxBF.length);
        assertArrayElementsAreEqual(gatherLeafValues(listH2, true), values_BF, 'listH2 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH3, true), values_BFxBF, 'listH3 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH4, true), values_BFxBFxBF, 'listH4 values are not correct');
        assertArrayElementsAreEqual(gatherLeafValues(listH5, true), values_BFxBFxBFxBF, 'listH5 values are not correct');
      });
    })

    suite('maintains the recompute property of relaxed nodes', () => {
      test('when appending', () => {
        const n0 = BRANCH_FACTOR - 1;
        const n1 = BRANCH_FACTOR - 2;
        var list0: ListState<any>;
        concat(list0 = makeList(makeValues(n0), 1, false), makeList(makeValues(n1, n0), 1, false));
        append(list0, ['X', 'Y', 'Z', 'K']);
        const root = rootSlot(list0);
        assert.strictEqual(root.subcount, n0 + n1 + 4);
        assert.strictEqual(root.size, n0 + n1 + 4);
        assert.strictEqual(root.recompute, 2);
      });
    });

    suite('creates a relaxed node when growing a tree from a relaxed root', () => {
      test('when appending', () => {
        const n0 = BRANCH_FACTOR - 1;
        const n1 = Math.pow(BRANCH_FACTOR, 2) - n0 - 1;
        var list0: ListState<any>;
        concat(list0 = makeList(makeValues(n0), 1, false), makeList(makeValues(n1, n0), 1, false));
        append(list0, ['X']);
        const root = rootSlot(list0);
        assert.strictEqual(root.subcount, BRANCH_FACTOR + 1);
        assert.strictEqual(root.size, n0 + n1 + 1);
        assert.strictEqual(root.recompute, 2);
      });
    });
  });

  suite('append()', () => {
    test('a single value appended to an empty list is present in the list', () => {
      var list = ListState.empty<any>(true);
      append(list, ['X']);
      assert.strictEqual(getAtOrdinal(list, 0), 'X');
    });

    test('one order of magnitude of values appended to an empty list are all present in the list', () => {
      var list = ListState.empty<any>(true);
      var values = makeValues(BRANCH_FACTOR);
      append(list, values);
      assert.deepEqual(gatherLeafValues(list), values);
    });

    test('two orders of magnitude of values appended to an empty list are all present in the list', () => {
      var list = ListState.empty<any>(true);
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      append(list, values);
      commitToRoot(list);
      assertArrayElementsAreEqual(gatherLeafValues(list), values);
    });

    test('three orders of magnitude of values appended to an empty list are all present in the list', () => {
      var list = ListState.empty<any>(true);
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      append(list, values);
      commitToRoot(list);
      assertArrayElementsAreEqual(gatherLeafValues(list), values);
    });

    test('values added to a list one-by-one are all present in the list', function() {
      this.timeout(30000);
      var list = ListState.empty<any>(true);
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      for(var i = 0; i < values.length; i++) {
        append(list, [values[i]]);
      }
      for(var i = 0; i < values.length; i++) {
        assert.strictEqual(getAtOrdinal(list, i), values[i], `incorrect value at index ${i}`);
      }
    });
  });

  suite('prepend()', () => {
    test('a single value prepended to an empty list is present in the list', () => {
      var list = ListState.empty<any>(true);
      prepend(list, ['X']);
      assert.strictEqual(getAtOrdinal(list, 0), 'X');
    });

    test('one order of magnitude of values prepended to an empty list are all present in the list', () => {
      var list = ListState.empty<any>(true);
      var values = makeValues(BRANCH_FACTOR);
      prepend(list, values);
      assert.deepEqual(gatherLeafValues(list), values);
    });

    test('two orders of magnitude of values prepended to an empty list are all present in the list', () => {
      var list = ListState.empty<any>(true);
      var values = makeValues(Math.pow(BRANCH_FACTOR, 2));
      prepend(list, values);
      commitToRoot(list);
      assertArrayElementsAreEqual(gatherLeafValues(list), values);
    });

    test('three orders of magnitude of values prepended to an empty list are all present in the list', () => {
      var list = ListState.empty<any>(true);
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      prepend(list, values);
      commitToRoot(list);
      assertArrayElementsAreEqual(gatherLeafValues(list), values);
    });

    test('values added to a list one-by-one are all present in the list', function() {
      this.timeout(30000);
      var list = ListState.empty<any>(true);
      var values = makeValues(Math.pow(BRANCH_FACTOR, 3));
      for(var i = 0; i < values.length; i++) {
        prepend(list, [values[i]]);
      }
      for(var i = 0; i < values.length; i++) {
        assert.strictEqual(getAtOrdinal(list, i), values[values.length - i - 1], `incorrect value at index ${i}`);
      }
    });
  });
});

