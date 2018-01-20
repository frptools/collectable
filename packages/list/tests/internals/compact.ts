import test from 'ava';
import { Slot, compact } from '../../src/internals';
import { BRANCH_FACTOR, BRANCH_INDEX_BITCOUNT, makeRelaxedSlot, makeStandardSlot } from '../helpers';

const large = BRANCH_FACTOR << BRANCH_INDEX_BITCOUNT;
const small = BRANCH_FACTOR;

function copySum (src: Slot<string>, srcidx: number, dest: Slot<string>, destidx: number): void {
  (<Slot<string>>dest.slots[destidx]).sum = (<Slot<string>>src.slots[srcidx]).sum;
}

test('child slots are moved from right to left until the slot distribution is balanced', t => {
  function makeRelaxedPair (): [Slot<string>, Slot<string>] {
    const leftSlots: Slot<string>[] = [], rightSlots: Slot<string>[] = [];
    const level = 1;
    let offset = 0;
    for(let i = 0; i < BRANCH_FACTOR; i++) {
      const size = (i === BRANCH_FACTOR - 4 || i === BRANCH_FACTOR - 3) ? small : large;
      leftSlots.push(makeStandardSlot(size, level, offset));
      offset += size;
    }
    for(let i = 0; i < 4; i++) {
      const size = i > 1 ? small : large;
      rightSlots.push(makeStandardSlot(size, level, offset));
      offset += size;
    }
    const left = makeRelaxedSlot(leftSlots);
    const right = makeRelaxedSlot(rightSlots);
    return [left, right];
  }

  function makeBalancedPair (originalPair: [Slot<string>, Slot<string>]): [Slot<string>, Slot<string>] {
    const leftSlots: Slot<string>[] = [];
    const level = 1;
    let offset = 0;
    for(let i = 0; i < BRANCH_FACTOR; i++) {
      leftSlots.push(makeStandardSlot(large, level, offset));
      offset += large;
    }
    const left = makeRelaxedSlot(leftSlots);
    const right = makeRelaxedSlot([
      makeStandardSlot(small*3, 1, offset),
      makeStandardSlot(small, 1, offset += small*3)
    ]);
    copySum(originalPair[0], BRANCH_FACTOR - 4, left, BRANCH_FACTOR - 4);
    copySum(originalPair[0], BRANCH_FACTOR - 2, left, BRANCH_FACTOR - 3);
    copySum(originalPair[0], BRANCH_FACTOR - 1, left, BRANCH_FACTOR - 2);
    copySum(originalPair[1], 0, left, BRANCH_FACTOR - 1);
    copySum(originalPair[1], 1, right, 0);
    copySum(originalPair[1], 3, right, 1);
    left.recompute = 4;
    right.recompute = 2;
    return [left, right];
  }

  const nodesA = makeRelaxedPair();
  const nodesB = makeBalancedPair(nodesA);
  t.notDeepEqual(nodesA, nodesB);
  compact(nodesA, BRANCH_INDEX_BITCOUNT*2, 2);
  t.deepEqual(nodesA, nodesB);
});

test('the left node is expanded if there is available slot capacity', t => {
  function makeRelaxedPair (): [Slot<string>, Slot<string>] {
    const leftSlots: Slot<string>[] = [], rightSlots: Slot<string>[] = [];
    const level = 1;
    let offset = 0;
    for(let i = 0; i < BRANCH_FACTOR - 1; i++) {
      const size = (i === BRANCH_FACTOR - 4 || i === BRANCH_FACTOR - 3) ? small : large;
      leftSlots.push(makeStandardSlot(size, level, offset));
      offset += size;
    }
    for(let i = 0; i < BRANCH_FACTOR - 2; i++) {
      const size = i > 1 ? large : small;
      rightSlots.push(makeStandardSlot(size, level, offset));
      offset += size;
    }
    const left = makeRelaxedSlot(leftSlots);
    const right = makeRelaxedSlot(rightSlots);
    return [left, right];
  }

  const nodes = makeRelaxedPair();
  t.is(nodes[0].slots.length, BRANCH_FACTOR - 1 );
  compact(nodes, BRANCH_INDEX_BITCOUNT*2, 2);
  t.is(nodes[0].slots.length, BRANCH_FACTOR);
});

test('the right node is emptied if all remaining slots can be moved left', t => {
  function makeRelaxedPair (): [Slot<string>, Slot<string>] {
    let offset = 0;
    const left = makeRelaxedSlot([
      makeStandardSlot(large, 1, 0),
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(small, 1, offset += large),
      makeStandardSlot(small, 1, offset += small),
      makeStandardSlot(large, 1, offset += small),
      makeStandardSlot(large, 1, offset += large)
    ]);
    const right = makeRelaxedSlot([
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(small, 1, offset += large),
      makeStandardSlot(small, 1, offset += small),
    ]);
    return [left, right];
  }

  function makeBalancedPair (originalPair: [Slot<string>, Slot<string>]): [Slot<string>, Slot<string>] {
    let offset = 0;
    const left = makeRelaxedSlot([
      makeStandardSlot(large, 1, 0),
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(large, 1, offset += large),
      makeStandardSlot(small*3, 1, offset += large),
      makeStandardSlot(small, 1, offset += small*3)
    ]);
    const right = makeRelaxedSlot([]);
    copySum(originalPair[0], 2, left, 2);
    copySum(originalPair[0], 4, left, 3);
    copySum(originalPair[0], 5, left, 4);
    copySum(originalPair[1], 0, left, 5);
    copySum(originalPair[1], 1, left, 6);
    copySum(originalPair[1], 3, left, 7);
    left.recompute = 6;
    right.recompute = 0;
    return [left, right];
  }

  const nodesA = makeRelaxedPair();
  const nodesB = makeBalancedPair(nodesA);
  t.notDeepEqual(nodesA, nodesB);
  compact(nodesA, BRANCH_INDEX_BITCOUNT*2, 2);
  t.deepEqual(nodesA, nodesB);
});
