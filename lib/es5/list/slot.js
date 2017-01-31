"use strict";
var ownership_1 = require("../shared/ownership");
var functions_1 = require("../shared/functions");
var array_1 = require("../shared/array");
var common_1 = require("./common");
var Slot = (function () {
    function Slot(group, size, sum, recompute, subcount, slots) {
        this.group = group;
        this.size = size;
        this.sum = sum;
        this.recompute = recompute;
        this.subcount = subcount;
        this.slots = slots;
    }
    Slot.empty = function () {
        return exports.emptySlot;
    };
    Slot.prototype.shallowClone = function (mode) {
        var group = mode === 0 ? this.group
            : mode === 1 ? -functions_1.abs(this.group)
                : functions_1.abs(this.group);
        var slot = new Slot(group, this.size, this.sum, this.recompute, this.subcount, this.slots);
        return slot;
    };
    Slot.prototype.shallowCloneToGroup = function (group, preserveStatus) {
        if (preserveStatus === void 0) { preserveStatus = false; }
        if (preserveStatus && this.group < 0) {
            group = -functions_1.abs(group);
        }
        return new Slot(group, this.size, this.sum, this.recompute, this.subcount, this.slots);
    };
    Slot.prototype.cloneToGroup = function (group, preserveStatus) {
        if (preserveStatus === void 0) { preserveStatus = false; }
        if (preserveStatus && this.group < 0) {
            group = -functions_1.abs(group);
        }
        return new Slot(group, this.size, this.sum, this.recompute, this.subcount, array_1.copyArray(this.slots));
    };
    Slot.prototype.toReservedNode = function (group) {
        if (group < 0)
            group = -group;
        if (this.group === group) {
            this.group = -group;
            return this;
        }
        return this.cloneToGroup(-group);
    };
    Slot.prototype.cloneAsPlaceholder = function (group) {
        return new Slot(-functions_1.abs(group), this.size, this.sum, this.recompute, this.subcount, new Array(this.slots.length));
    };
    Slot.prototype.cloneWithAdjustedRange = function (group, padLeft, padRight, isLeaf, preserveStatus) {
        if (preserveStatus === void 0) { preserveStatus = false; }
        if (preserveStatus && this.group < 0) {
            group = -functions_1.abs(group);
        }
        var src = this.slots;
        var slots = new Array(src.length + padLeft + padRight);
        var dest = new Slot(group, this.size, 0, this.recompute, 0, slots);
        adjustSlotBounds(this, dest, padLeft, padRight, isLeaf);
        return dest;
    };
    Slot.prototype.adjustRange = function (padLeft, padRight, isLeaf) {
        adjustSlotBounds(this, this, padLeft, padRight, isLeaf);
    };
    Slot.prototype.createParent = function (group, mode, expand) {
        var childSlot = this;
        if (mode === 2) {
            childSlot = childSlot.prepareForRelease(group);
        }
        else if (mode === 1) {
            childSlot = this.cloneAsPlaceholder(group);
        }
        var slotCount = 1, nodeSize = this.size, slotIndex = 0;
        if (functions_1.isDefined(expand)) {
            slotCount += expand.padLeft + expand.padRight;
            nodeSize += expand.sizeDelta;
            slotIndex += expand.padLeft;
        }
        var slots = new Array(slotCount);
        slots[slotIndex] = childSlot;
        return new Slot(group, nodeSize, 0, this.recompute === -1 ? -1 : slotCount, this.slots.length, slots);
    };
    Slot.prototype.isReserved = function () {
        return this.group < 0;
    };
    Slot.prototype.isReservedFor = function (group) {
        return this.group === -group;
    };
    Slot.prototype.isRelaxed = function () {
        return this.recompute !== -1;
    };
    Slot.prototype.isEditable = function (group) {
        return functions_1.abs(this.group) === group;
    };
    Slot.prototype.calculateRecompute = function (slotCountDelta) {
        return this.recompute === -1 ? -1 : this.recompute + slotCountDelta;
    };
    Slot.prototype.isSubtreeFull = function (shift) {
        return this.slots.length << shift === this.size;
    };
    Slot.prototype.prepareForRelease = function (currentGroup) {
        if (this.group === -currentGroup) {
            this.group = currentGroup;
            return this;
        }
        return this.group < 0 ? this.shallowClone(2) : this;
    };
    Slot.prototype.updatePlaceholder = function (actual) {
        this.size = actual.size;
        this.slots.length = actual.slots.length;
    };
    Slot.prototype.reserveChildAtIndex = function (slotIndex) {
        var index = common_1.verifyIndex(this.slots.length, slotIndex);
        var slot = this.slots[index];
        this.slots[index] = slot.cloneAsPlaceholder(slot.group);
        return slot;
    };
    Slot.prototype.resolveChild = function (ordinal, shift, out) {
        if (shift === 0) {
            if (ordinal >= this.slots.length)
                return false;
            out.slot = this.slots[ordinal];
            out.index = ordinal;
            out.offset = 0;
            return true;
        }
        var slotIndex = (ordinal >>> shift) & 31;
        if (slotIndex >= this.slots.length)
            return false;
        if (this.recompute === -1) {
            out.slot = this.slots[slotIndex];
            out.index = slotIndex;
            out.offset = slotIndex << shift;
            return true;
        }
        var invalidFromIndex = this.slots.length - this.recompute;
        var slot, i;
        if (slotIndex < invalidFromIndex) {
            do {
                slot = this.slots[slotIndex];
            } while (ordinal >= slot.sum && slotIndex < invalidFromIndex && ++slotIndex);
            if (slotIndex < invalidFromIndex) {
                out.slot = slot;
                out.index = slotIndex;
                out.offset = slotIndex === 0 ? 0 : this.slots[slotIndex - 1].sum;
                return true;
            }
        }
        var slotCap = 1 << shift;
        var maxSum = slotCap * invalidFromIndex;
        var sum = invalidFromIndex === 0 ? 0 : this.slots[invalidFromIndex - 1].sum;
        var lastIndex = this.slots.length - 1;
        var found = false;
        this.recompute = 0;
        for (i = invalidFromIndex; i <= lastIndex; i++) {
            if (i === lastIndex && sum === maxSum && !this.slots[i].isRelaxed()) {
                this.recompute = -1;
                if (!found) {
                    slot = this.slots[i];
                    if (sum + slot.size > ordinal) {
                        out.slot = slot;
                        out.index = i;
                        out.offset = sum - slot.size;
                        found = true;
                    }
                }
            }
            else {
                slot = this.slots[i];
                sum += slot.size;
                maxSum += slotCap;
                if (slot.sum !== sum) {
                    if (slot.group !== this.group && slot.group !== -this.group) {
                        this.slots[i] = slot = slot.shallowClone(0);
                    }
                    slot.sum = sum;
                }
                if (!found && sum > ordinal) {
                    out.slot = slot;
                    out.index = i;
                    out.offset = sum - slot.size;
                    found = true;
                }
            }
        }
        return found;
    };
    return Slot;
}());
exports.Slot = Slot;
function adjustSlotBounds(src, dest, padLeft, padRight, isLeaf) {
    var srcSlots = src.slots;
    var destSlots = dest.slots;
    var srcIndex, destIndex, amount;
    if (padLeft < 0) {
        amount = srcSlots.length + padLeft;
        srcIndex = -padLeft;
        destIndex = 0;
    }
    else {
        amount = srcSlots.length;
        srcIndex = 0;
        destIndex = padLeft;
    }
    if (padRight < 0) {
        amount += padRight;
    }
    var slotCountDelta = padLeft + padRight;
    if (srcSlots === destSlots && slotCountDelta > 0) {
        destSlots.length += padLeft + padRight;
    }
    var copySlots = padLeft !== 0 || srcSlots !== destSlots;
    var step = 1;
    if (padLeft > 0) {
        srcIndex += amount - 1;
        destIndex += amount - 1;
        step = -1;
    }
    if (isLeaf) {
        if (copySlots) {
            for (var c = 0; c < amount; srcIndex += step, destIndex += step, c++) {
                destSlots[destIndex] = srcSlots[srcIndex];
            }
        }
        dest.size = amount + functions_1.max(0, slotCountDelta);
    }
    else {
        if (copySlots || padRight < 0) {
            var subcount = 0, size = 0;
            for (var c = 0; c < amount; srcIndex += step, destIndex += step, c++) {
                var slot = srcSlots[srcIndex];
                subcount += slot.slots.length;
                size += slot.size;
                if (copySlots) {
                    destSlots[destIndex] = slot;
                }
            }
            dest.size = size;
            dest.subcount = subcount;
            dest.recompute = padLeft === 0 ? src.recompute === -1 ? -1 : src.recompute + padRight : destSlots.length;
        }
        else if (dest.recompute !== -1) {
            dest.recompute += padRight;
        }
    }
    if (srcSlots === destSlots && slotCountDelta < 0) {
        destSlots.length = amount;
    }
}
var ExpansionParameters = (function () {
    function ExpansionParameters() {
        this.padLeft = 0;
        this.padRight = 0;
        this.sizeDelta = 0;
    }
    ExpansionParameters.get = function (padLeft, padRight, sizeDelta) {
        var state = ExpansionParameters._default;
        state.padLeft = padLeft;
        state.padRight = padRight;
        state.sizeDelta = sizeDelta;
        return state;
    };
    return ExpansionParameters;
}());
ExpansionParameters._default = new ExpansionParameters();
exports.ExpansionParameters = ExpansionParameters;
exports.emptySlot = new Slot(ownership_1.nextId(), 0, 0, -1, 0, []);

//# sourceMappingURL=slot.js.map
