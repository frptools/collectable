"use strict";
const functions_1 = require("../shared/functions");
const common_1 = require("./common");
const view_1 = require("./view");
const slot_1 = require("./slot");
const state_1 = require("./state");
function isInRange(ordinal, leftOffset, slotSize) {
    return ordinal >= leftOffset && ordinal < leftOffset + slotSize;
}
function isViewInRange(view, ordinal, listSize) {
    return view.anchor === 0
        ? isInRange(ordinal, view.offset, view.slot.size)
        : isInRange(ordinal, common_1.invertOffset(view.offset, view.slot.size, listSize), view.slot.size);
}
exports.isViewInRange = isViewInRange;
function isAncestor(upperView, lowerView, listSize) {
    var upperOffset = lowerView.anchor === upperView.anchor ? upperView.offset
        : common_1.invertOffset(upperView.offset, upperView.slot.size + lowerView.sizeDelta, listSize);
    return upperOffset <= lowerView.offset && upperOffset + upperView.slot.size + lowerView.sizeDelta >= lowerView.offset + lowerView.slot.size;
}
function selectView(state, ordinal, asWriteTarget) {
    var left = state.left, right = state.right, resolve = asWriteTarget;
    var anchor;
    if (left.isNone()) {
        anchor = right.isRoot() || isInRange(ordinal, common_1.invertOffset(right.offset, right.slot.size, state.size), right.slot.size)
            ? 1 : 0;
        if (anchor === 0)
            resolve = true;
    }
    else if (right.isNone()) {
        anchor = left.isRoot() || isInRange(ordinal, left.offset, left.slot.size)
            ? 0 : 1;
        if (anchor === 1)
            resolve = true;
    }
    else {
        var leftEnd = left.bound();
        var rightStart = state.size - right.bound();
        anchor = rightStart <= ordinal ? 1
            : leftEnd > ordinal ? 0
                : common_1.invertAnchor(state.lastWrite);
    }
    return resolve
        ? state_1.getView(state, anchor, asWriteTarget, ordinal)
        : anchor === 0 ? left : right;
}
class TreeWorker {
    constructor() {
        this.state = state_1.emptyState(false);
        this.previous = view_1.View.none();
        this.current = view_1.View.none();
        this.other = view_1.View.none();
        this.otherCommittedChild = view_1.View.none();
        this.otherCommitMode = -1;
        this.committedOther = false;
        this.slotResult = { slot: slot_1.Slot.empty(), index: 0, offset: 0 };
        this.group = 0;
        this.shift = 0;
    }
    static _getDefaults() {
        var defaults = TreeWorker._defaults;
        if (functions_1.isUndefined(defaults)) {
            TreeWorker._defaults = defaults = {
                defaultPrimary: new TreeWorker(),
                defaultSecondary: new TreeWorker(),
                defaultOther: new TreeWorker(),
                defaultTemporary: new TreeWorker(),
            };
        }
        return defaults;
    }
    static defaultPrimary() {
        return TreeWorker._getDefaults().defaultPrimary;
    }
    static defaultSecondary() {
        return TreeWorker._getDefaults().defaultSecondary;
    }
    static defaultOther() {
        return TreeWorker._getDefaults().defaultOther;
    }
    static defaultTemporary() {
        return TreeWorker._getDefaults().defaultTemporary;
    }
    static refocusView(state, view, ordinal, asAltView, asWriteTarget) {
        var worker = TreeWorker.defaultTemporary().reset(state, view, state.group);
        view = worker.refocusView(ordinal, asAltView, asWriteTarget);
        worker.dispose();
        return view;
    }
    static focusOrdinal(state, ordinal, asWriteTarget) {
        ordinal = common_1.verifyIndex(state.size, ordinal);
        if (ordinal === -1)
            return void 0;
        var view = selectView(state, ordinal, asWriteTarget);
        return isViewInRange(view, ordinal, state.size) ? view
            : TreeWorker.refocusView(state, view, ordinal, false, asWriteTarget);
    }
    static focusEdge(state, edge, asWriteTarget) {
        var view = state_1.getView(state, edge, asWriteTarget);
        view = view.offset > 0 || (asWriteTarget && !view.slot.isReserved() && !view.isRoot())
            ? TreeWorker.refocusView(state, view, edge === 0 ? 0 : state.size - 1, false, asWriteTarget)
            : view;
        return view;
    }
    static focusHead(state, asWriteTarget) {
        return TreeWorker.focusEdge(state, 0, asWriteTarget);
    }
    static focusTail(state, asWriteTarget) {
        return TreeWorker.focusEdge(state, 1, asWriteTarget);
    }
    static focusView(state, ordinal, anchor, asWriteTarget) {
        var view = state_1.getView(state, anchor, true, ordinal);
        return isViewInRange(view, ordinal, state.size) ? view
            : TreeWorker.refocusView(state, view, ordinal, false, true);
    }
    isRoot() {
        return this.current.isRoot();
    }
    hasOtherView() {
        return !this.other.isNone();
    }
    isOtherViewUncommitted() {
        return !this.committedOther && !this.other.isNone();
    }
    reset(state, view, group, otherCommitMode = 0) {
        this.state = state;
        this.current = view;
        this.group = group;
        this.shift = 0;
        if (otherCommitMode === -1) {
            this.committedOther = true;
        }
        else {
            this.other = state_1.getOtherView(state, view.anchor);
            this.committedOther = this.other.isNone();
            this.otherCommitMode = otherCommitMode;
        }
        return this;
    }
    dispose() {
        this.state = state_1.emptyState(false);
        this.previous = view_1.View.none();
        this.current = view_1.View.none();
        this.other = view_1.View.none();
        this.otherCommittedChild = view_1.View.none();
        this.slotResult.slot = slot_1.Slot.empty();
    }
    ascend(mode, expandParent) {
        var childView = this.current;
        var childSlot = childView.slot;
        var group = this.group;
        var parentView;
        var parentSlot;
        var hasChanges;
        if (this.committedOther && !this.otherCommittedChild.isNone()) {
            this.otherCommittedChild = view_1.View.none();
        }
        var persistChild = mode === 3 ? (mode = 2, false) : true;
        var slotIndex = childView.slotIndex;
        if (childView.isRoot()) {
            var slotCount = 1, slotSize = childSlot.size;
            var recompute = childSlot.isRelaxed() ? slotCount : -1;
            if (functions_1.isDefined(expandParent)) {
                slotCount += expandParent.padLeft + expandParent.padRight;
                slotIndex += expandParent.padLeft;
                slotSize += expandParent.sizeDelta;
                if (recompute !== -1) {
                    recompute += functions_1.max(expandParent.padRight, -1);
                }
                this.state.size += expandParent.sizeDelta;
            }
            var slots = new Array(slotCount);
            slots[slotIndex] = mode === 1 ? childSlot.cloneAsPlaceholder(group) : childSlot;
            parentSlot = new slot_1.Slot(group, slotSize, 0, recompute, childSlot.slots.length, slots);
            parentView = view_1.View.create(group, childView.offset, childView.anchor, 0, 0, 0, view_1.View.none(), parentSlot);
            hasChanges = false;
        }
        else {
            parentView = childView.parent.ensureEditable(group);
            parentSlot = parentView.slot;
            var hasChanges = childView.hasUncommittedChanges();
            var prepend = 0, append = 0;
            if (hasChanges || mode === 1 || functions_1.isDefined(expandParent)) {
                if (functions_1.isDefined(expandParent)) {
                    append = expandParent.padRight;
                    prepend = expandParent.padLeft;
                    slotIndex += prepend;
                }
                if (!parentSlot.isEditable(group)) {
                    parentView.slot = parentSlot = functions_1.isDefined(expandParent)
                        ? parentSlot.cloneWithAdjustedRange(group, prepend, append, false, true)
                        : parentSlot.cloneToGroup(group, true);
                }
                else if (functions_1.isDefined(expandParent)) {
                    parentSlot.adjustRange(prepend, append, false);
                }
                if (functions_1.isDefined(expandParent)) {
                    this.state.size += expandParent.sizeDelta;
                    if ((prepend && parentView.anchor === 0) || (!prepend && parentView.anchor === 1)) {
                        parentView.flipAnchor(this.state.size - childView.sizeDelta - expandParent.sizeDelta);
                    }
                }
                if (!this.committedOther && isAncestor(parentView, this.other, this.state.size)) {
                    this.commitOther(parentView, prepend);
                }
                if (functions_1.isDefined(expandParent)) {
                    parentSlot.size += expandParent.sizeDelta;
                    if (!parentView.isRoot()) {
                        parentView.sizeDelta += expandParent.sizeDelta;
                    }
                }
                if (hasChanges) {
                    if (!parentView.isRoot()) {
                        parentView.sizeDelta += childView.sizeDelta;
                    }
                    parentSlot.subcount += childView.slotsDelta;
                    parentSlot.size += childView.sizeDelta;
                    if (parentSlot.isRelaxed() || childSlot.isRelaxed() || (childView.slotsDelta < 0 && slotIndex < parentSlot.slots.length - 1 && parentSlot.recompute === -1)) {
                        parentSlot.recompute = functions_1.max(parentSlot.recompute, parentSlot.slots.length - slotIndex);
                    }
                    else {
                        parentSlot.recompute = -1;
                    }
                }
            }
            if (mode === 1 || (hasChanges && mode === 0 && childSlot.isReserved())) {
                var childSlotRef = parentSlot.slots[slotIndex];
                if (childSlotRef.isReservedFor(group)) {
                    if (hasChanges) {
                        childSlotRef.size = childSlot.size;
                        childSlotRef.slots.length = childSlot.slots.length;
                    }
                }
                else {
                    var sum = childSlotRef.sum;
                    parentSlot.slots[slotIndex] = childSlotRef = childSlot.cloneAsPlaceholder(group);
                    childSlotRef.sum = sum;
                }
                if (childSlotRef.isReservedFor(group)) {
                    if (hasChanges) {
                        childSlotRef.updatePlaceholder(childSlot);
                    }
                }
                else {
                    parentSlot.slots[slotIndex] = childSlot.cloneAsPlaceholder(group);
                }
            }
            else if (mode === 2) {
                if (childSlot.isReserved()) {
                    if (!parentSlot.isEditable(group)) {
                        parentView.slot = parentSlot = parentSlot.cloneToGroup(group, true);
                    }
                    if (childSlot.isEditable(group)) {
                        childSlot.group = group;
                    }
                    else {
                        childSlot = childSlot.cloneToGroup(group);
                    }
                    childSlot.sum = parentSlot.slots[slotIndex].sum;
                    parentSlot.slots[slotIndex] = childSlot;
                }
            }
        }
        if (parentSlot.recompute !== -1 && parentSlot.size === 32 << (this.shift + 5)) {
            parentSlot.recompute = -1;
        }
        if (!this.committedOther && isAncestor(parentView, this.other, this.state.size)) {
            this.commitOther(parentView, 0);
        }
        if (persistChild) {
            if (mode === 1 && !childSlot.isReserved()) {
                if (childSlot.isEditable(group)) {
                    childSlot.group = -group;
                }
                else {
                    childSlot = childSlot.cloneToGroup(-group);
                }
            }
            if (!childView.isEditable(group)) {
                childView = childView.cloneToGroup(group);
                if (this.shift === 0) {
                    state_1.setView(this.state, childView);
                }
            }
            if (hasChanges || childSlot !== childView.slot || childView.parent !== parentView || this.otherCommitMode === -1) {
                childView.slot = childSlot;
                childView.parent = parentView;
                childView.slotsDelta = 0;
                childView.sizeDelta = 0;
            }
            childView.slotIndex = slotIndex;
            this.previous = childView;
        }
        else if (childView.isEditable(group)) {
            view_1.View.pushReusableView(childView);
        }
        this.current = parentView;
        this.shift += 5;
        return parentView;
    }
    commitOther(replacementParent, slotIndexOffset) {
        var otherView = this.other;
        if (slotIndexOffset === 0 && this.shift === 0 && !otherView.hasUncommittedChanges()
            && otherView.parent === replacementParent
            && (this.otherCommitMode === 0
                || (this.otherCommitMode === 1) === otherView.slot.isReserved())) {
            this.committedOther = true;
            this.otherCommittedChild = otherView;
            return;
        }
        if (!otherView.isEditable(this.group)) {
            otherView = otherView.cloneToGroup(this.group);
        }
        var anchor = otherView.anchor;
        state_1.setView(this.state, this.other = this.otherCommitMode === 3 ? view_1.View.empty(anchor) : otherView);
        var worker = TreeWorker.defaultOther().reset(this.state, otherView, this.group, -1);
        while (worker.shift < this.shift) {
            otherView = worker.ascend(this.otherCommitMode);
        }
        otherView.parent = replacementParent;
        otherView.slotIndex += slotIndexOffset;
        worker.ascend(this.otherCommitMode);
        this.committedOther = true;
        this.otherCommittedChild = worker.previous;
        worker.dispose();
    }
    ascendToOrdinal(ordinal, mode, ensureBranchReserved) {
        var view = this.current, target = view, branchFound = false;
        var shift = this.shift;
        do {
            view = this.ascend(!this.hasOtherView() || (this.hasOtherView() && !this.committedOther) || mode === 1 ? mode : 0);
            if (!branchFound) {
                branchFound = isViewInRange(view, ordinal, this.state.size);
                if (branchFound) {
                    shift = this.shift;
                    target = view;
                    if (ensureBranchReserved) {
                        mode = 1;
                    }
                }
            }
        } while (!branchFound || (mode === 1 && !view.isRoot() && !view.slot.isReserved()));
        this.shift = shift;
        this.current = target;
        return target;
    }
    descendToOrdinal(ordinal, asWriteTarget) {
        var view = this.current, shift = this.shift, out = this.slotResult;
        var offset = view.anchor === 1 ? common_1.invertOffset(view.offset, view.slot.size, this.state.size) : view.offset;
        do {
            view.slot.resolveChild(ordinal - offset, shift, out);
            if (out.slot.isReserved()) {
                while (view !== this.current) {
                    var discarded = view, view = discarded.parent;
                    view_1.View.pushReusableView(discarded);
                }
                return void 0;
            }
            shift -= 5;
            offset += out.offset;
            if (asWriteTarget) {
                view.ensureSlotEditable().slots[out.index] = out.slot.cloneAsPlaceholder(this.group);
                out.slot = out.slot.toReservedNode(this.group);
            }
            view = view_1.View.create(this.group, offset, 0, out.index, 0, 0, view, out.slot);
        } while (shift > 0);
        this.previous = this.current;
        this.current = view;
        this.shift = 0;
        return view;
    }
    refocusView(ordinal, asAltView, asWriteTarget) {
        ordinal = common_1.verifyIndex(this.state.size, ordinal);
        var anchor = asAltView ? common_1.invertAnchor(this.current.anchor) : this.current.anchor;
        this.ascendToOrdinal(ordinal, asAltView ? 0 : 3, asWriteTarget);
        var view = this.descendToOrdinal(ordinal, asWriteTarget);
        if (functions_1.isUndefined(view)) {
            this.reset(this.state, state_1.getOtherView(this.state, anchor), this.group, -1);
            this.ascendToOrdinal(ordinal, 0, false);
            view = this.descendToOrdinal(ordinal, asWriteTarget);
        }
        if (view.anchor !== anchor) {
            view.flipAnchor(this.state.size);
        }
        state_1.setView(this.state, view);
        return view;
    }
}
exports.TreeWorker = TreeWorker;
function getAtOrdinal(state, ordinal) {
    var view = TreeWorker.focusOrdinal(state, ordinal, false);
    if (view === void 0)
        return void 0;
    return view.slot.slots[getLeafIndex(view, ordinal, state.size)];
}
exports.getAtOrdinal = getAtOrdinal;
function getLeafIndex(view, ordinal, listSize) {
    return ordinal - (view.anchor === 0 ? view.offset : common_1.invertOffset(view.offset, view.slot.size, listSize));
}
exports.getLeafIndex = getLeafIndex;

//# sourceMappingURL=traversal.js.map
