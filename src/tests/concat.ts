import * as chalk from 'chalk';
import {inspect} from 'util';

declare function require(moduleName: string): any;

import {assert} from 'chai';
import {List} from '../collectable/list';
import {Slot} from '../collectable/list/slot';
import {join} from '../collectable/list/concat';
import {compact} from '../collectable/list/compact';
import {shiftDownRoundUp} from '../collectable/list/common';
import {CONST} from '../collectable/list/const';

const BRANCH_FACTOR = CONST.BRANCH_FACTOR;
const BRANCH_INDEX_BITCOUNT = CONST.BRANCH_INDEX_BITCOUNT;

var large = BRANCH_FACTOR << BRANCH_INDEX_BITCOUNT;
var small = BRANCH_FACTOR;

function copySum(src: Slot<string>, srcidx: number, dest: Slot<string>, destidx: number): void {
  (<Slot<string>>dest.slots[destidx]).sum = (<Slot<string>>src.slots[srcidx]).sum;
}

function makeJoinablePair(height: number, subtractLeftSize = 0, subtractRightSize = 0): [Slot<string>, Slot<string>] {
  var level = height - 1;
  var left = makeStandardSlot((((BRANCH_FACTOR >>> 1) - 1) << (level*BRANCH_INDEX_BITCOUNT)) - subtractLeftSize, level, 0);
  var right = makeStandardSlot(((BRANCH_FACTOR >>> 1) << (level*BRANCH_INDEX_BITCOUNT)) - subtractRightSize, level, left.size);
  return [left, right];
}

suite('compact()', () => {
  test('child slots are moved from right to left until the slot distribution is balanced', () => {
    function makeRelaxedPair(): [Slot<string>, Slot<string>] {
      var leftSlots: Slot<string>[] = [], rightSlots: Slot<string>[] = [];
      const level = 1;
      for(var i = 0, offset = 0; i < BRANCH_FACTOR; i++) {
        var size = (i === BRANCH_FACTOR - 4 || i === BRANCH_FACTOR - 3) ? small : large;
        leftSlots.push(makeStandardSlot(size, level, offset));
        offset += size;
      }
      for(i = 0; i < 4; i++) {
        var size = i > 1 ? small : large;
        rightSlots.push(makeStandardSlot(size, level, offset));
        offset += size;
      }
      var left = makeRelaxedSlot(leftSlots);
      var right = makeRelaxedSlot(rightSlots);
      return [left, right];
    }

    function makeBalancedPair(originalPair: [Slot<string>, Slot<string>]): [Slot<string>, Slot<string>] {
      var leftSlots: Slot<string>[] = [];
      const level = 1;
      for(var i = 0, offset = 0; i < BRANCH_FACTOR; i++) {
        leftSlots.push(makeStandardSlot(large, level, offset));
        offset += large;
      }
      var left = makeRelaxedSlot(leftSlots);
      var right = makeRelaxedSlot([
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

    var nodesA = makeRelaxedPair();
    var nodesB = makeBalancedPair(nodesA);
    assert.notDeepEqual(nodesA, nodesB);
    compact(nodesA, BRANCH_INDEX_BITCOUNT*2, 2);
    assert.deepEqual(nodesA, nodesB);
  });

  test('the left node is expanded if there is available slot capacity', () => {
    function makeRelaxedPair(): [Slot<string>, Slot<string>] {
      var leftSlots: Slot<string>[] = [], rightSlots: Slot<string>[] = [];
      const level = 1;
      for(var i = 0, offset = 0; i < BRANCH_FACTOR - 1; i++) {
        var size = (i === BRANCH_FACTOR - 4 || i === BRANCH_FACTOR - 3) ? small : large;
        leftSlots.push(makeStandardSlot(size, level, offset));
        offset += size;
      }
      for(i = 0; i < 4; i++) {
        var size = i > 1 ? small : large;
        rightSlots.push(makeStandardSlot(size, level, offset));
        offset += size;
      }
      var left = makeRelaxedSlot(leftSlots);
      var right = makeRelaxedSlot(rightSlots);
      return [left, right];
    }

    function makeBalancedPair(originalPair: [Slot<string>, Slot<string>]): [Slot<string>, Slot<string>] {
      var leftSlots: Slot<string>[] = [];
      const level = 1;
      for(var i = 0, offset = 0; i < BRANCH_FACTOR; i++) {
        var size = i === BRANCH_FACTOR - 1 ? small*3 : large;
        leftSlots.push(makeStandardSlot(size, level, offset));
        offset += size;
      }
      var left = makeRelaxedSlot(leftSlots);
      var right = makeRelaxedSlot([
        makeStandardSlot(small, 1, offset)
      ]);
      var leftCount = originalPair[0].slots.length;
      // copySum(originalPair[0], leftCount - 4, left, leftCount - 4);
      copySum(originalPair[0], leftCount - 3, left, leftCount - 3);
      copySum(originalPair[0], leftCount - 1, left, leftCount - 2);
      copySum(originalPair[1], 0, left, leftCount - 1);
      copySum(originalPair[1], 1, left, leftCount);
      copySum(originalPair[1], 3, right, 0);

      // copySum(originalPair[0], 3, left, 3);
      // copySum(originalPair[0], 5, left, 4);
      // copySum(originalPair[0], 6, left, 5);
      // copySum(originalPair[1], 0, left, 6);
      // copySum(originalPair[1], 1, left, 7);
      // copySum(originalPair[1], 3, right, 0);
      left.recompute = 4;
      right.recompute = 1;
      return [left, right];
    }

    var nodesA = makeRelaxedPair();
    var nodesB = makeBalancedPair(nodesA);
    assert.notDeepEqual(nodesA, nodesB);
    compact(nodesA, BRANCH_INDEX_BITCOUNT*2, 2);
    assert.deepEqual(nodesA, nodesB);
  });

  test('the right node is emptied if all remaining slots can be moved left', () => {
    function makeRelaxedPair(): [Slot<string>, Slot<string>] {
      var offset = 0;
      var left = makeRelaxedSlot([
        makeStandardSlot(large, 1, 0),
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(small, 1, offset += large),
        makeStandardSlot(small, 1, offset += small),
        makeStandardSlot(large, 1, offset += small),
        makeStandardSlot(large, 1, offset += large)
      ]);
      var right = makeRelaxedSlot([
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(small, 1, offset += large),
        makeStandardSlot(small, 1, offset += small),
      ]);
      return [left, right];
    }

    function makeBalancedPair(originalPair: [Slot<string>, Slot<string>]): [Slot<string>, Slot<string>] {
      var offset = 0;
      var left = makeRelaxedSlot([
        makeStandardSlot(large, 1, 0),
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(large, 1, offset += large),
        makeStandardSlot(small*3, 1, offset += large),
        makeStandardSlot(small, 1, offset += small*3)
      ]);
      var right = makeRelaxedSlot([]);
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

    var nodesA = makeRelaxedPair();
    var nodesB = makeBalancedPair(nodesA);
    assert.notDeepEqual(nodesA, nodesB);
    compact(nodesA, BRANCH_INDEX_BITCOUNT*2, 2);
    assert.deepEqual(nodesA, nodesB);
  });
});

suite('[concatenation functions]', () => {

//   suite('join()', () => {
//     suite('When passed a pair of topmost nodes that should be merged into a single node,', () => {
//       test('the function returns true', () => {
//         var joined = join(makeJoinablePair(2), BRANCH_INDEX_BITCOUNT, true);
//         assert.isTrue(joined);
//       });

//       test('all of the slots in the right node are moved to the left node', () => {
//         var nodes = makeJoinablePair(2);
//         var leftSize = nodes[0].size;
//         var rightSize = nodes[1].size;
//         join(nodes, BRANCH_INDEX_BITCOUNT, true);
//         assert.strictEqual(nodes[0].size, leftSize + rightSize);
//         assert.strictEqual(nodes[1].size, 0);
//       });

//       test('the cumulative sum is recalculated for each slot', () => {
//         var nodes = makeJoinablePair(3);
//         join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
//         for(var i = 0, sum = 0; i < nodes[0].slots.length; i++) {
//           sum += BRANCH_FACTOR << BRANCH_INDEX_BITCOUNT;
//           assert.strictEqual((<Slot<string>>nodes[0].slots[i]).sum, sum);
//         }
//       });

//       test('the left node does not change into a relaxed node if all of the left slots were fully populated', () => {
//         var nodes = makeJoinablePair(3);
//         join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
//         assert.isFalse(nodes[0].isRelaxed());
//       })

//       test('the left node becomes a relaxed node if any slots other than the last are not fully populated', () => {
//         var nodes = makeJoinablePair(3, 1);
//         join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
//         assert.isTrue(nodes[0].isRelaxed());
//       });

//       test('the subcount of the right node is added to the subcount of the left node', () => {
//         var nodes = makeJoinablePair(3);
//         var leftSubcount = nodes[0].subcount, rightSubcount = nodes[1].subcount;
//         join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
//         assert.strictEqual(nodes[0].subcount, leftSubcount + rightSubcount);
//       });

//       test('none-leaf nodes are joined correctly', () => {
//         var nodes = makeJoinablePair(3);
//         var expectedValues = gatherLeafValues(makeStandardSlot(nodes[0].size + nodes[1].size, 2, 0));
//         join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
//         assert.deepEqual(gatherLeafValues(nodes[0]), expectedValues);
//       });

//       test('leaf nodes are joined correctly', () => {
//         var nodes = makeJoinablePair(1);
//         var expectedValues = gatherLeafValues(makeStandardSlot(nodes[0].size + nodes[1].size, 0, 0));
//         join(nodes, 0, true);
//         assert.deepEqual(gatherLeafValues(nodes[0]), expectedValues);
//       });
//     });

//     suite('When passed a pair of nodes that do not need to be balanced,', () => {
//       test('the function returns false', () => {
//         var left = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2) - 1, 2, 0);
//         var right = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2), 2, 0);
//         assert.isFalse(join([left, right], BRANCH_INDEX_BITCOUNT*2, false));
//       });

//       test('the input nodes are not modified', () => {
//         var left = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2) - 1, 2, 0);
//         var right = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2), 2, 0);
//         var nodes: [Slot<string>, Slot<string>] = [left, right];
//         var leftJSON = JSON.stringify(left);
//         var rightJSON = JSON.stringify(right);
//         join(nodes, BRANCH_INDEX_BITCOUNT*2, false);
//         assert.strictEqual(leftJSON, JSON.stringify(nodes[0]));
//         assert.strictEqual(rightJSON, JSON.stringify(nodes[1]));
//       });
//     });

//     suite('When passed a pair of nodes that need to be balanced,', () => {
//       test('the function returns true', () => {
//         var result = join(makeRelaxedPair(), BRANCH_INDEX_BITCOUNT*2, false);
//         assert.isTrue(result);
//       });
//     });
//   });
});

function text(i: number) {
  return '#' + i;
}

function makeStandardSlot(requiredSize: number, level: number, valueOffset: number): Slot<string> {
  var slots: (Slot<string>|string)[];
  var size = 0;
  var subcount = 0;
  if(level === 0) {
    slots = makeValues(requiredSize, valueOffset);
    size = requiredSize;
  }
  else {
    slots = [];
    var lowerSubtreeMaxSize = 1 << (BRANCH_INDEX_BITCOUNT*level);
    while(size < requiredSize) {
      var lowerSize = Math.min(requiredSize - size, lowerSubtreeMaxSize);
      var lowerSlot = makeStandardSlot(lowerSize, level - 1, valueOffset + size);
      subcount += lowerSlot.slots.length;
      size += lowerSize;
      slots.push(lowerSlot);
    }
  }
  var slot = new Slot<string>(1, size, 0, -1, subcount, slots);
  delete slot.id;
  return slot;
}

function makeRelaxedSlot(slots: Slot<string>[]): Slot<string> {
  var size = 0, subcount = 0, sum = 0;
  slots.forEach(slot => {
    size += slot.size;
    subcount += slot.slots.length;
    sum += slot.size;
    slot.sum = sum;
  });
  var slot = new Slot<string>(1, size, 0, 0, subcount, slots);
  delete slot.id;
  return slot;
}

function gatherLeafValues(slot: Slot<string>): any[] {
  return slot.slots.map(slot => slot instanceof Slot ? slot.slots.map(gatherLeafValues) : slot);
}

function makeValues(count: number, valueOffset = 0): string[] {
  var values: string[] = [];
  for(var i = 0; i < count; i++) {
    values.push(text(i + valueOffset));
  }
  return values;
}
