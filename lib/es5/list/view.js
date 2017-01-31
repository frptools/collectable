"use strict";
var functions_1 = require("../shared/functions");
var common_1 = require("./common");
var slot_1 = require("./slot");
var View = (function () {
    function View(group, offset, anchor, slotIndex, sizeDelta, slotsDelta, parent, slot) {
        this.group = group;
        this.offset = offset;
        this.anchor = anchor;
        this.slotIndex = slotIndex;
        this.sizeDelta = sizeDelta;
        this.slotsDelta = slotsDelta;
        this.parent = parent;
        this.slot = slot;
        this.parent = parent;
        this.slotIndex = slotIndex;
    }
    View.popReusableView = function (group) {
        var view = _nextReusableView;
        if (view.isNone()) {
            return void 0;
        }
        _nextReusableView = view.parent;
        view.parent = View.none();
        view.group = group;
        return view;
    };
    View.pushReusableView = function (view) {
        view.slot = slot_1.Slot.empty();
        var next = _nextReusableView;
        if (next.group > 50)
            return;
        view.group = next.group + 1;
        view.parent = next;
        _nextReusableView = view;
    };
    View.create = function (group, offset, anchor, slotIndex, sizeDelta, slotsDelta, parent, slot) {
        var view = View.popReusableView(group);
        if (functions_1.isUndefined(view)) {
            return new View(group, offset, anchor, slotIndex, sizeDelta, slotsDelta, parent, slot);
        }
        view.group = group;
        view.offset = offset;
        view.anchor = anchor;
        view.slotIndex = slotIndex;
        view.sizeDelta = sizeDelta;
        view.slotsDelta = slotsDelta;
        view.parent = parent;
        view.slot = slot;
        return view;
    };
    View.empty = function (anchor) {
        return anchor === 0 ? emptyLeftView : emptyRightView;
    };
    View.none = function () {
        return voidView;
    };
    View.prototype.isNone = function () {
        return this.group === 0;
    };
    View.prototype.isDefaultEmpty = function () {
        return this === emptyLeftView || this === emptyRightView;
    };
    View.prototype.isRoot = function () {
        return this.parent === voidView;
    };
    View.prototype.isEditable = function (group) {
        return functions_1.abs(this.group) === group;
    };
    View.prototype.hasUncommittedChanges = function () {
        return this.sizeDelta !== 0 || this.slotsDelta !== 0;
    };
    View.prototype.bound = function () {
        return this.offset + this.slot.size;
    };
    View.prototype.slotCount = function () {
        return this.slot.slots.length;
    };
    View.prototype.recalculateDeltas = function () {
        var upper = this.parent.slot.slots[this.slotIndex];
        if (this.slot === upper)
            return;
        this.slotsDelta = this.slot.slots.length - upper.slots.length;
        this.sizeDelta = this.slot.size - upper.size;
    };
    View.prototype.cloneToGroup = function (group) {
        return View.create(group, this.offset, this.anchor, this.slotIndex, this.sizeDelta, this.slotsDelta, this.parent, this.slot);
    };
    View.prototype.flipAnchor = function (listSize) {
        this.anchor = common_1.invertAnchor(this.anchor);
        if (!this.isRoot()) {
            this.offset = common_1.invertOffset(this.offset, this.slot.size, listSize);
        }
    };
    View.prototype.setCommitted = function (parent) {
        this.sizeDelta = 0;
        this.slotsDelta = 0;
        if (functions_1.isDefined(parent)) {
            this.parent = parent;
        }
    };
    View.prototype.ensureEditable = function (group, ensureSlotEditable) {
        if (ensureSlotEditable === void 0) { ensureSlotEditable = false; }
        var view = this;
        if (!view.isEditable(group)) {
            view = view.cloneToGroup(group);
        }
        var slot = view.slot;
        if (ensureSlotEditable && !slot.isEditable(group)) {
            view.slot = slot.cloneToGroup(group, true);
        }
        return view;
    };
    View.prototype.ensureSlotEditable = function (shallow) {
        if (shallow === void 0) { shallow = false; }
        return this.slot.isEditable(this.group) ? this.slot
            : (this.slot = this.slot.cloneToGroup(this.group, true));
    };
    View.prototype.ensureStatus = function (mode, enforceGroup) {
        if (this.slot.isEditable(this.group)) {
            var isReserved = this.slot.isReserved();
            if (isReserved) {
                if (mode === 2)
                    this.slot.group = this.group;
            }
            else {
                if (mode === 1)
                    this.slot.group = -this.group;
            }
            return this.slot;
        }
        else if (enforceGroup) {
            return this.slot = this.slot.cloneToGroup(mode === 1
                ? -this.group : this.group, mode === 0);
        }
        return mode === 0
            ? this.slot
            : (this.slot = this.slot.shallowClone(mode));
    };
    View.prototype.ensureChildReferenceStatus = function (childSlot, index, mode) {
        var slot = this.slot;
        var refSlot = slot.slots[index];
        var isReserved = refSlot.isReserved();
        if (mode === 0 && !isReserved) {
            return;
        }
        if (mode === 2) {
            if (isReserved) {
                var sum = refSlot.sum;
                if (childSlot.sum !== sum) {
                    if (!childSlot.isEditable(this.group)) {
                        childSlot = childSlot.shallowClone(2);
                    }
                    childSlot.sum = sum;
                }
                this.slot.slots[index] = childSlot;
            }
            return;
        }
        if (mode === 1 && !isReserved) {
            this.ensureSlotEditable().slots[index] = childSlot.cloneAsPlaceholder(this.group);
            return;
        }
        if (refSlot.slots.length !== childSlot.slots.length || refSlot.size !== childSlot.size) {
            if (refSlot.isEditable(this.group)) {
                refSlot.updatePlaceholder(childSlot);
            }
            else {
                this.ensureSlotEditable().slots[index] = childSlot.cloneAsPlaceholder(this.group);
            }
        }
    };
    View.prototype.setAsRoot = function () {
        if (this.slot.isReserved()) {
            if (this.slot.isReservedFor(this.group)) {
                this.slot.group = -this.slot.group;
            }
            else {
                this.slot = this.slot.cloneToGroup(this.group);
            }
        }
        this.parent = View.none();
        this.offset = 0;
        this.sizeDelta = 0;
        this.slotsDelta = 0;
        this.slotIndex = 0;
    };
    View.prototype.replaceSlot = function (slot) {
        this.slot = slot;
    };
    View.prototype.adjustSlotRange = function (padLeft, padRight, isLeaf) {
        var slot = this.slot;
        var oldSize = slot.size;
        if (slot.isEditable(this.group)) {
            slot.adjustRange(padLeft, padRight, isLeaf);
        }
        else {
            this.slot = slot = slot.cloneWithAdjustedRange(this.group, padLeft, padRight, isLeaf, true);
        }
        if (!this.isRoot()) {
            this.sizeDelta += slot.size - oldSize;
            this.slotsDelta += padLeft + padRight;
        }
    };
    View.prototype.disposeIfInGroup = function () {
        for (var i = 0; i < arguments.length; i++) {
            if (this.group === arguments[i]) {
                View.pushReusableView(this);
                return;
            }
        }
    };
    return View;
}());
exports.View = View;
var voidView = new View(0, 0, 0, 0, 0, 0, void 0, slot_1.emptySlot);
var emptyLeftView = new View(0, 0, 0, 0, 0, 0, voidView, slot_1.emptySlot);
var emptyRightView = new View(0, 0, 1, 0, 0, 0, voidView, slot_1.emptySlot);
var _nextReusableView = voidView;

//# sourceMappingURL=view.js.map
