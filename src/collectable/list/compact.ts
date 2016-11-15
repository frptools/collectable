import {CONST, max, min} from './common';
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
    // Move the position markers until the left is at a location that is eligible for receiving subslots from the right
    if(isReductionTargetMet || !left.compactable) {
      incrementPos(left, nodes);
      if(removed > 0) {
        copySlotLeft(left, right);
      }
      incrementPos(right, nodes);
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
      var rslots = right.lower.slots;
      var startIndex = lslots.length;
      var slotsToMove = min(CONST.BRANCH_FACTOR - startIndex, rslots.length);
      var subcountMoved = 0;
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
      if(rslots.length === 0) {
        removed++;
        isReductionTargetMet = removed === reductionTarget;
        incrementPos(right, nodes);
      }
    }
  } while(left.absoluteIndex < lastFinalIndex);

  nodes[1].slots.length = max(0, finalSlotCount - nodes[0].slots.length);
  nodes[1].recompute = nodes[1].slots.length;
}
