declare function require(moduleName: string): any;

import {assert} from 'chai';
import {ListState} from '../collectable/list/state';
import {Slot} from '../collectable/list/slot';
import {append, prepend} from '../collectable/list/capacity';
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
const values_BFx2_p1 = makeValues(BRANCH_FACTOR*2 + 1);
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
      });
    });

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
});

