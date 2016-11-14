import * as chalk from 'chalk';

import {CONST} from './const';
import {max, min, log, publish} from './common';
import {Slot, emptySlot} from './slot';

interface CompactionState<T> {
  rightSideNode: Slot<T>;
  upperLeft: UpperPosition<T>;
  upperRight: UpperPosition<T>;
  lowerLeft: LowerPosition<T>;
  lowerRight: LowerPosition<T>;
  emptyIndicesLeft: number[];
  emptyIndicesRight: number[];
  isTreeBottom: boolean;
  slotsEliminated: number;
  slotsToEliminate: number;
}

interface UpperPosition<T> {
  node: Slot<T>;
  slots: (Slot<T>|T)[];
  index: number;
}

interface LowerPosition<T> {
  node: Slot<T>;
  slots: (Slot<T>|T)[];
}

interface Position<T> {
  upperIndex: number;
  lowerIndex: number;
  lastLowerIndex: number;
  absoluteIndex: number;
  compactable: boolean;
  upper: Slot<T>;
  lower: Slot<T>;
}

function isCompactable<T>(node: Slot<T>): boolean {
  return node.slots.length < CONST.BRANCH_INDEX_MASK;
}

function incrementPos<T>(pos: Position<T>, nodes: Slot<T>[]): void {
// log(`[incrementPos] upper: ${pos.upperIndex}, lower: ${pos.lowerIndex}, abs: ${pos.absoluteIndex}, cutoff: ${pos.lastLowerIndex}`);
  if(pos.upperIndex === 1 && pos.lowerIndex === pos.upper.slots.length - 1) {
    return;
  }
  if(pos.upperIndex === 0 && pos.lowerIndex >= pos.lastLowerIndex) {
    pos.lowerIndex = 0;
    pos.upperIndex++;
    pos.upper = nodes[pos.upperIndex];
  }
  else {
    pos.lowerIndex++;
  }
  pos.absoluteIndex++;
  var lower = pos.upper.slots[pos.lowerIndex];
  if(lower !== void 0) {
    pos.lower = <Slot<T>>lower;
    pos.compactable = isCompactable(pos.lower);
  }
}

function copySlotLeft<T>(left: Position<T>, right: Position<T>): void {
  var slot = <Slot<T>>right.upper.slots[right.lowerIndex];
  left.upper.slots[left.lowerIndex] = slot;
  left.lower = slot;
  left.compactable = isCompactable(slot);

right.upper.slots[right.lowerIndex] = emptySlot;
right.lower = emptySlot;

  if(left.upperIndex !== right.upperIndex) {
    left.upper.size += slot.size;
    left.upper.subcount += slot.slots.length;
    right.upper.size -= slot.size;
    right.upper.subcount -= slot.slots.length;
  }
}

function ensureEditable<T>(pos: Position<T>): void {
  if(pos.lower.group !== pos.upper.group) {
    var lower = pos.lower.clone(pos.upper.group);
    pos.lower = lower;
    pos.upper.slots[pos.lowerIndex] = lower;
  }
}

function makePosition<T>(node: Slot<T>, lastLowerIndex: number): Position<T> {
  var slot = <Slot<T>>node.slots[0];
  return {
    upperIndex: 0,
    lowerIndex: 0,
    lastLowerIndex,
    absoluteIndex: 0,
    compactable: isCompactable(slot),
    upper: node,
    lower: slot
  };
}

export function compact<T>(nodes: [Slot<T>, Slot<T>], shift: number, reductionTarget: number, lists?: any): void {
// function publish(...args) { console.log(args[args.length - 1]); }
// function log(arg, ...args) { console.log(arg, ...args); }
// var allowColors = false;

// function describeNode(node: Slot<T>, leftOffset: number, rightOffset: number, leftIndex: number, rightIndex: number) {
//   return !allowColors
//     ? `[${node.slots.map((slot: Slot<T>, i: number) => `${i + leftOffset === leftIndex ? 'L' : ''}${i + rightOffset === rightIndex ? 'R' : ''}${slot.slots.length}`)}]`
//     : `[${node.slots.map((slot: Slot<T>, i: number) =>
//       i + leftOffset === leftIndex
//         ? i + rightOffset === rightIndex
//           ? chalk.bgBlue.yellow(slot.slots.length.toString())
//           : chalk.blue(slot.slots.length.toString())
//         : i + rightOffset === rightIndex
//           ? chalk.yellow(slot.slots.length.toString())
//           : slot.slots.length)}]`;
// }
// function dump() {
//   publish(lists, false, `${describeNode(nodes[0], 0, 0, left.absoluteIndex, right.absoluteIndex)} + ${describeNode(nodes[1], nodes[0].slots.length, right.lastLowerIndex + 1, left.absoluteIndex, right.absoluteIndex)}`);
// }
// publish(lists, false, `START COMPACTION (reduction target: ${reductionTarget})`);

  var isRecomputeUpdated = false;
  var isTreeBase = shift === CONST.BRANCH_INDEX_BITCOUNT;
  var finalSlotCount = nodes[0].slots.length + nodes[1].slots.length - reductionTarget;
  var lastFinalIndex = finalSlotCount - 1;
  var isReductionTargetMet = false;
  var oldLeftCount = nodes[0].slots.length;
  var newLeftCount = min(finalSlotCount, CONST.BRANCH_FACTOR);
  nodes[0].slots.length = newLeftCount;

  var left = makePosition(nodes[0], newLeftCount - 1);
  var right = makePosition(nodes[0], oldLeftCount - 1);
  incrementPos(right, nodes);
  var removed = 0;

  do {
// publish(lists, false, `### LOOP (current reduction: ${removed}) ${isReductionTargetMet ? ' [REDUCTION TARGET IS MET]' : ''}`);
    // Move the position markers until the left is at a location that is eligible for receiving subslots from the right
// log(`left is compactable: ${left.compactable}, right is compactable: ${right.compactable}`);
    if(isReductionTargetMet || !left.compactable) {
      incrementPos(left, nodes);
// log(`incremented left: absolute index is now ${left.absoluteIndex}, lower index is ${left.lowerIndex}`);
      if(removed > 0) {
// log(`copy slot left`);
        copySlotLeft(left, right);
      }
      incrementPos(right, nodes);
// log(`incremented right: absolute index is now ${right.absoluteIndex}, lower index is ${right.lowerIndex}`);
// dump();
    }

    if(!isReductionTargetMet && left.compactable) {
      // Mount the left position marker at the same location as the right position marker
      ensureEditable(left);
      ensureEditable(right);

      if(!isRecomputeUpdated) {
        isRecomputeUpdated = true;
        left.upper.recompute = max(left.upper.recompute, left.upper.slots.length - left.lowerIndex);
      }

      var lslots = left.lower.slots;
// dump();
// log(`at this point, there are ${lslots.length} slots on the left`);
      var rslots = right.lower.slots;
      var startIndex = lslots.length;
      var slotsToMove = min(CONST.BRANCH_FACTOR - startIndex, rslots.length);
      var subcountMoved = 0;
// log(`${slotsToMove} slots will be moved; left slot count will be changed to ${startIndex + slotsToMove}`);
      lslots.length = startIndex + slotsToMove;

      // Copy slots from right to left until the right node is empty or the left node is full
      var sizeMoved = isTreeBase ? slotsToMove : 0;
      for(var i = startIndex, j = 0; j < slotsToMove; i++, j++) {
        var slot = <Slot<T>>rslots[j];
        if(!isTreeBase) {
          sizeMoved += slot.size;
          subcountMoved += slot.slots.length;
        }
        lslots[i] = slot;
        if(j + slotsToMove < rslots.length) {
          rslots[j] = rslots[j + slotsToMove];
        }
      }

      left.lower.size += sizeMoved;
      right.lower.size -= sizeMoved;
      if(!isTreeBase) {
        left.lower.subcount += subcountMoved;
        right.lower.subcount -= subcountMoved;
      }

      if(left.upperIndex !== right.upperIndex) {
        left.upper.size += sizeMoved;
        left.upper.subcount += slotsToMove;
        right.upper.size -= sizeMoved;
        right.upper.subcount -= slotsToMove;
      }

      left.compactable = isCompactable(left.lower);

      // If the right-side slot has been drained, then we are one step closer to the slot reduction target
      rslots.length -= slotsToMove;
// log(`right slot count is now ${rslots.length}`);
// dump();
      if(rslots.length === 0) {
// log(`right is now empty; incrementing...`);
        removed++;
        isReductionTargetMet = removed === reductionTarget;
// if(isReductionTargetMet) log('REDUCTION TARGET IS NOW MET');
// log(left, right);
        incrementPos(right, nodes);
// log(`incremented right again: absolute index is now ${right.absoluteIndex}, lower index is ${right.lowerIndex}`);
      }
    }
// dump();
  } while(left.absoluteIndex < lastFinalIndex);

  nodes[1].slots.length = max(0, finalSlotCount - nodes[0].slots.length);
  nodes[1].recompute = nodes[1].slots.length;
// dump();
}
