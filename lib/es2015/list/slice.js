"use strict";
const common_1 = require("./common");
const state_1 = require("./state");
const view_1 = require("./view");
const slot_1 = require("./slot");
const traversal_1 = require("./traversal");
function sliceList(state, start, end) {
    start = common_1.normalizeIndex(state.size, start);
    end = common_1.normalizeIndex(state.size, end);
    if (end <= 0 || start >= end || start >= state.size) {
        if (state.size > 0) {
            state.left = view_1.View.empty(0);
            state.right = view_1.View.empty(0);
            state.size = 0;
            state.lastWrite = 1;
        }
        return;
    }
    if (end >= state.size && start <= 0) {
        return;
    }
    if (start < 0)
        start = 0;
    if (end >= state.size)
        end = state.size;
    sliceInternal(state, start, end);
}
exports.sliceList = sliceList;
function sliceInternal(state, start, end) {
    var doneLeft = start === 0, doneRight = end === state.size, focusedLeft = false, focusedRight = false;
    var left, right;
    if (state.left.isNone()) {
        right = state_1.getView(state, 1, true);
        if (!traversal_1.isViewInRange(right, end - 1, state.size)) {
            left = state_1.getView(state, 0, true, start);
            right = traversal_1.isViewInRange(left, end - 1, state.size) ? left : traversal_1.TreeWorker.refocusView(state, right, end - 1, false, true);
        }
        else if (traversal_1.isViewInRange(right, start, state.size)) {
            left = right;
        }
        else {
            left = state_1.getView(state, 0, true, start);
            right = state.right;
        }
        focusedLeft = true;
        focusedRight = true;
    }
    else if (state.right.isNone()) {
        left = state_1.getView(state, 0, true, start);
        if (!traversal_1.isViewInRange(left, start, state.size)) {
            right = state_1.getView(state, 1, true, end - 1);
            left = traversal_1.isViewInRange(right, start, state.size) ? right : traversal_1.TreeWorker.refocusView(state, left, start, false, true);
        }
        else if (traversal_1.isViewInRange(left, end - 1, state.size)) {
            right = left;
        }
        else {
            right = state_1.getView(state, 1, true, end - 1);
            left = state.left;
        }
        focusedLeft = true;
        focusedRight = true;
    }
    else {
        left = state.left;
        right = state.right;
    }
    if (!focusedLeft) {
        if (!traversal_1.isViewInRange(left, start, state.size)) {
            left = traversal_1.TreeWorker.refocusView(state, left, start, false, true);
            right = state.right;
        }
        focusedLeft = true;
        if (traversal_1.isViewInRange(left, end - 1, state.size)) {
            right = left;
            focusedRight = true;
        }
    }
    var areSame = left === right;
    if (!focusedRight && !traversal_1.isViewInRange(right, end - 1, state.size)) {
        right = traversal_1.TreeWorker.refocusView(state, right, end - 1, false, true);
        left = state.left;
    }
    else if (!right.isEditable(state.group)) {
        state_1.setView(state, right = right.cloneToGroup(state.group));
        if (areSame)
            left = right;
    }
    if (!left.isEditable(state.group)) {
        state_1.setView(state, left = left.cloneToGroup(state.group));
        if (areSame)
            right = left;
    }
    if (areSame) {
        var leftOffset = left.anchor === 0 ? left.offset : common_1.invertOffset(left.offset, left.slot.size, state.size);
        if (leftOffset === start) {
            doneLeft = true;
        }
        if (left.slot.size === end - leftOffset) {
            doneRight = true;
        }
    }
    var rightBound = doneRight ? 0 : calculateRightEnd(right, state.size);
    var leftOffset = getOffset(left, 0, state.size);
    var truncateLeft = doneLeft || start <= leftOffset ? 0 : leftOffset - start;
    var truncateRight = doneRight || end >= rightBound ? 0 : end - rightBound;
    var isRoot = (doneLeft ? right : left).isRoot();
    var leftWorker = void 0;
    var rightWorker = void 0;
    if (truncateLeft) {
        left.adjustSlotRange(truncateLeft, left === right ? truncateRight : 0, true);
        if (isRoot || leftOffset === 0 || left === right) {
            doneLeft = true;
        }
    }
    if (truncateRight) {
        if (!truncateLeft || left !== right) {
            right.adjustSlotRange(0, truncateRight, true);
        }
        if (isRoot || right.offset === 0 || left === right) {
            doneRight = true;
        }
    }
    else if (!truncateLeft && left === right) {
        doneLeft = true;
        doneRight = true;
    }
    if (!doneLeft || !doneRight) {
        leftWorker = traversal_1.TreeWorker.defaultPrimary().reset(state, left, state.group, -1);
        rightWorker = traversal_1.TreeWorker.defaultSecondary().reset(state, right, state.group, -1);
    }
    var noAscent = doneLeft && doneRight;
    while (!doneLeft || !doneRight) {
        if (!doneRight) {
            rightBound = calculateRightEnd(right, state.size);
        }
        truncateLeft = doneLeft ? 0 : -left.slotIndex;
        truncateRight = doneRight ? 0 : right.slotIndex - right.parent.slotCount() + 1;
        var areSiblings = left !== right && left.parent === right.parent;
        left = leftWorker.ascend(1, doneLeft && !areSiblings ? void 0 : slot_1.ExpansionParameters.get(truncateLeft, areSiblings ? truncateRight : 0, 0));
        leftWorker.previous.offset = 0;
        if (!doneLeft) {
            if (getOffset(left, 0, state.size) === 0) {
                doneLeft = true;
            }
        }
        if (areSiblings) {
            right.parent = left;
            right.slotIndex += truncateLeft;
            doneLeft = true;
            doneRight = true;
        }
        right = rightWorker.ascend(1, doneRight ? void 0 : slot_1.ExpansionParameters.get(0, truncateRight, 0));
        rightWorker.previous.offset = 0;
        isRoot = (doneLeft ? right : left).isRoot();
        if (!doneRight && !isRoot && getOffset(right, 1, state.size) === 0) {
            doneRight = true;
        }
    }
    if (!isRoot && left === right) {
        left.setAsRoot();
        if (noAscent) {
            var otherView = state.left === left ? state.right : state.left;
            if (!otherView.isNone()) {
                state_1.setView(state, view_1.View.empty(otherView.anchor));
            }
        }
    }
    state.size = end - start;
    state.lastWrite = start > 0 ? 0 : 1;
}
function calculateRightEnd(view, listSize) {
    return view.anchor === 0
        ? view.offset + view.slot.size
        : listSize - view.offset;
}
function getOffset(view, anchor, listSize) {
    return view.anchor === anchor ? view.offset : common_1.invertOffset(view.offset, view.slot.size, listSize);
}

//# sourceMappingURL=slice.js.map
