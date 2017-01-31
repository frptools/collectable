"use strict";
const ownership_1 = require("../shared/ownership");
const array_1 = require("../shared/array");
const common_1 = require("./common");
const traversal_1 = require("./traversal");
const compact_1 = require("./compact");
const slot_1 = require("./slot");
const view_1 = require("./view");
const state_1 = require("./state");
function concatLists(leftState, rightState) {
    if (leftState.size === 0) {
        return rightState;
    }
    if (rightState.size === 0) {
        return leftState;
    }
    if ((leftState === rightState && (leftState.group = ownership_1.nextId())) || rightState.group !== leftState.group) {
        rightState = state_1.cloneState(rightState, leftState.group, true);
    }
    var left = traversal_1.TreeWorker.defaultPrimary().reset(leftState, traversal_1.TreeWorker.focusTail(leftState, true), leftState.group, 2);
    var right = traversal_1.TreeWorker.defaultSecondary().reset(rightState, traversal_1.TreeWorker.focusHead(rightState, true), leftState.group, 2);
    if (left.current.slot.group !== left.group) {
        left.current = left.current.ensureEditable(leftState.group, true);
        state_1.setView(leftState, left.current);
    }
    if (right.current.slot.group !== right.group) {
        right.current = right.current.ensureEditable(rightState.group, true);
        state_1.setView(rightState, right.current);
    }
    var group = leftState.group, leftIsRoot = left.isRoot(), rightIsRoot = right.isRoot(), isJoined = false, nodes = [left.current.slot, right.current.slot];
    do {
        if (left.current.anchor === 1) {
            left.current.flipAnchor(leftState.size);
        }
        if (right.current.anchor === 1) {
            right.current.flipAnchor(rightState.size);
        }
        var rightSlotCount = right.current.slotCount();
        var rightSize = right.current.slot.size;
        if (join(nodes, left.shift, leftIsRoot || rightIsRoot, [leftState, rightState])) {
            var slotCountDelta = rightSlotCount - nodes[1].slots.length;
            var slotSizeDelta = rightSize - nodes[1].size;
            isJoined = (leftIsRoot || rightIsRoot) && nodes[1].slots.length === 0;
            left.current.replaceSlot(nodes[0]);
            if (!isJoined || !left.isRoot()) {
                left.current.slotsDelta += slotCountDelta;
                left.current.sizeDelta += slotSizeDelta;
            }
            if (isJoined) {
                if (!rightIsRoot) {
                    if (right.current.slot.isReserved()) {
                        left.current.slot.group = -group;
                    }
                    left.current.parent = right.current.parent;
                    left.current.recalculateDeltas();
                }
                if (!right.otherCommittedChild.isNone()) {
                    right.otherCommittedChild.slotIndex += left.current.slotCount() - slotCountDelta;
                    right.otherCommittedChild.parent = left.current;
                }
                if (left.shift > 0 && right.current.slot.size > 0) {
                    right.previous.slotIndex += slotCountDelta;
                    right.previous.parent = left.current;
                    right.previous.recalculateDeltas();
                }
            }
            else {
                right.current.replaceSlot(nodes[1]);
                right.current.sizeDelta -= slotSizeDelta;
                right.current.slotsDelta -= slotCountDelta;
            }
        }
        if (!isJoined) {
            left.ascend(2);
            if (left.shift === 5) {
                left.previous.flipAnchor(leftState.size + rightState.size);
            }
            right.ascend(2);
            if (!leftIsRoot) {
                leftIsRoot = left.current.isRoot();
            }
            if (!rightIsRoot)
                rightIsRoot = right.current.isRoot();
            nodes[0] = left.current.slot;
            nodes[1] = right.current.slot;
        }
    } while (!isJoined);
    leftState.size += rightState.size;
    if (right.hasOtherView()) {
        if (!left.hasOtherView()) {
            if (leftState.right.anchor !== 0) {
                leftState.right.flipAnchor(leftState.size);
            }
            state_1.setView(leftState, leftState.right);
        }
        if (right.other.slot.size > 0) {
            state_1.setView(leftState, right.other);
        }
        else {
            right.other.disposeIfInGroup(rightState.group, leftState.group);
            state_1.setView(leftState, view_1.View.empty(1));
        }
    }
    leftState.lastWrite = leftState.right.slot.isReserved() || leftState.left.isNone() ? 1 : 0;
    left.dispose();
    right.dispose();
    return leftState;
}
exports.concatLists = concatLists;
function join(nodes, shift, canFinalizeJoin, lists) {
    var left = nodes[0], right = nodes[1];
    var count = left.slots.length + right.slots.length;
    if (canFinalizeJoin && count <= 32) {
        var relaxed = left.isRelaxed() || right.isRelaxed() || !left.isSubtreeFull(shift);
        left.slots = shift === 0
            ? array_1.concatToNewArray(left.slots, right.slots, 0)
            : common_1.concatSlotsToNewArray(left.slots, right.slots);
        left.size += right.size;
        left.subcount += right.subcount;
        left.recompute = relaxed ? 0 : -1;
        nodes[1] = slot_1.Slot.empty();
        return true;
    }
    if (shift === 0) {
        return false;
    }
    var reducedCount = calculateRebalancedSlotCount(count, left.subcount + right.subcount);
    if (count === reducedCount) {
        return false;
    }
    compact_1.compact([left, right], shift, count - reducedCount, lists);
    return true;
}
exports.join = join;
function calculateExtraSearchSteps(upperSlots, lowerSlots) {
    var steps = upperSlots - (((lowerSlots - 1) >>> 5) + 1);
    return steps;
}
exports.calculateExtraSearchSteps = calculateExtraSearchSteps;
function calculateRebalancedSlotCount(upperSlots, lowerSlots) {
    var reduction = calculateExtraSearchSteps(upperSlots, lowerSlots) - 2;
    return upperSlots - (reduction > 0 ? reduction : 0);
}
exports.calculateRebalancedSlotCount = calculateRebalancedSlotCount;

//# sourceMappingURL=concat.js.map
