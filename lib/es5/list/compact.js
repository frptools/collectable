"use strict";
var functions_1 = require("../shared/functions");
var slot_1 = require("./slot");
function isCompactable(node) {
    return node.slots.length < 31;
}
function incrementPos(pos, nodes) {
    if (pos.upperIndex === 1 && pos.lowerIndex === pos.upper.slots.length - 1) {
        return;
    }
    if (pos.upperIndex === 0 && pos.lowerIndex >= pos.lastLowerIndex) {
        pos.lowerIndex = 0;
        pos.upperIndex++;
        pos.upper = nodes[pos.upperIndex];
    }
    else {
        pos.lowerIndex++;
    }
    pos.absoluteIndex++;
    var lower = pos.upper.slots[pos.lowerIndex];
    if (lower !== void 0) {
        pos.lower = lower;
        pos.compactable = isCompactable(pos.lower);
    }
}
function copySlotLeft(left, right) {
    var slot = right.upper.slots[right.lowerIndex];
    left.upper.slots[left.lowerIndex] = slot;
    left.lower = slot;
    left.compactable = isCompactable(slot);
    right.upper.slots[right.lowerIndex] = slot_1.emptySlot;
    right.lower = slot_1.emptySlot;
    if (left.upperIndex !== right.upperIndex) {
        left.upper.size += slot.size;
        left.upper.subcount += slot.slots.length;
        right.upper.size -= slot.size;
        right.upper.subcount -= slot.slots.length;
    }
}
function ensureEditable(pos) {
    if (pos.lower.group !== pos.upper.group) {
        var lower = pos.lower.cloneToGroup(pos.upper.group, true);
        pos.lower = lower;
        pos.upper.slots[pos.lowerIndex] = lower;
    }
}
function makePosition(node, lastLowerIndex) {
    var slot = node.slots[0];
    return {
        upperIndex: 0,
        lowerIndex: 0,
        lastLowerIndex: lastLowerIndex,
        absoluteIndex: 0,
        compactable: isCompactable(slot),
        upper: node,
        lower: slot
    };
}
function compact(nodes, shift, reductionTarget, lists) {
    var isRecomputeUpdated = false;
    var isTreeBase = shift === 5;
    var finalSlotCount = nodes[0].slots.length + nodes[1].slots.length - reductionTarget;
    if (finalSlotCount > 32 && nodes[0].subcount + nodes[1].subcount <= (32 << 5)) {
        reductionTarget += finalSlotCount - 32;
        finalSlotCount = 32;
    }
    var lastFinalIndex = finalSlotCount - 1;
    var isReductionTargetMet = false;
    var oldLeftCount = nodes[0].slots.length;
    var newLeftCount = functions_1.min(finalSlotCount, 32);
    nodes[0].slots.length = newLeftCount;
    var left = makePosition(nodes[0], newLeftCount - 1);
    var right = makePosition(nodes[0], oldLeftCount - 1);
    incrementPos(right, nodes);
    var removed = 0;
    do {
        if (isReductionTargetMet || !left.compactable) {
            incrementPos(left, nodes);
            if (removed > 0) {
                copySlotLeft(left, right);
            }
            incrementPos(right, nodes);
        }
        if (!isReductionTargetMet && left.compactable) {
            ensureEditable(left);
            ensureEditable(right);
            if (!isRecomputeUpdated) {
                isRecomputeUpdated = true;
                left.upper.recompute = functions_1.max(left.upper.recompute, left.upper.slots.length - left.lowerIndex);
            }
            var lslots = left.lower.slots;
            var rslots = right.lower.slots;
            var startIndex = lslots.length;
            var slotsToMove = functions_1.min(32 - startIndex, rslots.length);
            var subcountMoved = 0;
            lslots.length = startIndex + slotsToMove;
            var sizeMoved = isTreeBase ? slotsToMove : 0;
            for (var i = startIndex, j = 0, total = functions_1.max(rslots.length - slotsToMove, slotsToMove); j < total; i++, j++) {
                var slot = rslots[j];
                if (!isTreeBase) {
                    sizeMoved += slot.size;
                    subcountMoved += slot.slots.length;
                }
                if (j < slotsToMove) {
                    lslots[i] = slot;
                }
                if (j + slotsToMove < rslots.length) {
                    rslots[j] = rslots[j + slotsToMove];
                }
            }
            left.lower.size += sizeMoved;
            right.lower.size -= sizeMoved;
            if (!isTreeBase) {
                left.lower.subcount += subcountMoved;
                right.lower.subcount -= subcountMoved;
            }
            if (left.upperIndex !== right.upperIndex) {
                left.upper.size += sizeMoved;
                left.upper.subcount += slotsToMove;
                right.upper.size -= sizeMoved;
                right.upper.subcount -= slotsToMove;
            }
            left.compactable = isCompactable(left.lower);
            rslots.length -= slotsToMove;
            if (rslots.length === 0) {
                removed++;
                isReductionTargetMet = removed === reductionTarget;
                incrementPos(right, nodes);
            }
        }
    } while (left.absoluteIndex < lastFinalIndex);
    nodes[1].slots.length = functions_1.max(0, finalSlotCount - nodes[0].slots.length);
    nodes[1].recompute = nodes[1].slots.length;
}
exports.compact = compact;

//# sourceMappingURL=compact.js.map
