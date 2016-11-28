declare function require(moduleName: string): any;

import {assert} from 'chai';
import {ListState} from '../collectable/list/state';
import {Slot} from '../collectable/list/slot';
import {increaseCapacity} from '../collectable/list/capacity';
import {concat} from '../collectable/list/concat';

import {
  BRANCH_FACTOR,
  slotValues,
  gatherLeafValues,
  commitToRoot,
  tailSize,
  headSize,
  headSlot,
  tailSlot,
  rootSlot,
  makeValues,
  populateValues
} from './test-utils';

// hN = enough nodes to create a tree of height N
// pN = plus N
// mN = minus N
// BF = number of nodes equivalent to the branch factor (generally 32)
// NxM = the value of N multipled by M
const values_BFx2_p1 = makeValues(BRANCH_FACTOR*2 + 1);
const values_h2_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 2) + BRANCH_FACTOR + 1);
const values_h3_pBF_p1 = makeValues(Math.pow(BRANCH_FACTOR, 3) + BRANCH_FACTOR + 1);

function makeList(values: any[], initialSize: number, prepend: boolean): ListState<any> {
  const list = ListState.empty<any>(true);
  if(initialSize > 0) {
    populateValues(increaseCapacity(list, initialSize, false), values.slice(0, initialSize));
    commitToRoot(list);
  }
  populateValues(increaseCapacity(list, values.length - initialSize, prepend), values, 1, 1);
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

      // test('when prepending', () => {
      //   const list = makeList(values_BFx2_p1, 1, true);
      //   assert.strictEqual(list.size, values_BFx2_p1.length);
      //   assert.deepEqual(slotValues(headSlot(list)), values_BFx2_p1.slice(1, 1));
      //   assert.deepEqual(slotValues(tailSlot(list)), values_BFx2_p1.slice(BRANCH_FACTOR + 1));
      //   assert.strictEqual(headSize(list), 1);
      //   assert.strictEqual(tailSize(list), BRANCH_FACTOR);
      // });
    });

    suite('increases depth when the root is full', () => {
      test('when appending', function() {
        const listH2 = makeList(values_BFx2_p1, 1, false);
        const listH3 = makeList(values_h2_pBF_p1, 1, false);
        const listH4 = makeList(values_h3_pBF_p1, 1, false);
        assert.strictEqual(listH2.size, values_BFx2_p1.length);
        assert.strictEqual(listH3.size, values_h2_pBF_p1.length);
        assert.strictEqual(listH4.size, values_h3_pBF_p1.length);
        assert.deepEqual(gatherLeafValues(listH2, true), values_BFx2_p1);
        assert.deepEqual(gatherLeafValues(listH3, true), values_h2_pBF_p1);
        assert.deepEqual(gatherLeafValues(listH4, true), values_h3_pBF_p1);
      });

      // test('when prepending', function() {
      //   const listH2 = makeList(values_BFx2_p1, 1, true);
      //   const listH3 = makeList(values_h2_pBF_p1, 1, true);
      //   const listH4 = makeList(values_h3_pBF_p1, 1, true);
      //   assert.strictEqual(listH2.size, values_BFx2_p1.length);
      //   assert.strictEqual(listH3.size, values_h2_pBF_p1.length);
      //   assert.strictEqual(listH4.size, values_h3_pBF_p1.length);
      //   assert.deepEqual(gatherLeafValues(listH2, true), values_BFx2_p1.slice(1).concat(makeValues(1)));
      //   assert.deepEqual(gatherLeafValues(listH3, true), values_h2_pBF_p1.slice(1).concat(makeValues(1)));
      //   assert.deepEqual(gatherLeafValues(listH4, true), values_h3_pBF_p1.slice(1).concat(makeValues(1)));
      // });
    });

    suite('maintains the recompute property of relaxed nodes', () => {
      test('when appending', () => {
        const n0 = BRANCH_FACTOR - 1;
        const n1 = BRANCH_FACTOR - 2;
        var list0: ListState<any>;
        concat(list0 = makeList(makeValues(n0), 1, false), makeList(makeValues(n1, n0), 1, false));
        populateValues(increaseCapacity(list0, 4, false), ['X', 'Y', 'Z', 'K'], n1);
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
        populateValues(increaseCapacity(list0, 1, false), ['X'], n1);
        const root = rootSlot(list0);
        assert.strictEqual(root.subcount, BRANCH_FACTOR + 1);
        assert.strictEqual(root.size, n0 + n1 + 1);
        assert.strictEqual((<Slot<any>>root.slots[0]).sum, n0 + n1);
        assert.strictEqual(root.recompute, 1);
      });
    });
  });
});

