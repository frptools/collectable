"use strict";
const functions_1 = require("../shared/functions");
const common_1 = require("./common");
const traversal_1 = require("./traversal");
const slot_1 = require("./slot");
const view_1 = require("./view");
const state_1 = require("./state");
class Collector {
    constructor() {
        this.elements = void 0;
        this.index = 0;
        this.marker = 0;
    }
    static default(count, prepend) {
        var c = Collector._default;
        c.elements = new Array(count);
        c.index = prepend ? count : 0;
        return c;
    }
    static one(elements) {
        var c = this._default;
        c.elements = [elements];
        return c;
    }
    set(elements) {
        this.elements[this.index] = elements;
        this.index++;
    }
    mark() {
        this.marker = this.index;
    }
    restore() {
        this.index = this.marker;
    }
    populate(values, innerIndex) {
        var elements = this.elements;
        for (var i = 0, outerIndex = 0, inner = elements[0]; i < values.length; i++, innerIndex >= inner.length - 1 ? (innerIndex = 0, inner = elements[++outerIndex]) : (++innerIndex)) {
            inner[innerIndex] = values[i];
        }
        this.elements = void 0;
    }
}
Collector._default = new Collector();
exports.Collector = Collector;
function increaseCapacity(state, increaseBy, prepend) {
    var view = prepend ? state.left : state.right;
    var slot = view.slot;
    var group = state.group;
    var numberOfAddedSlots = calculateSlotsToAdd(slot.slots.length, increaseBy);
    state.size += numberOfAddedSlots;
    if (!view.isEditable(group)) {
        view = view.cloneToGroup(group);
        state_1.setView(state, view);
    }
    if (numberOfAddedSlots > 0) {
        if (slot.isEditable(group)) {
            slot.adjustRange(prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
        }
        else {
            view.slot = slot = slot.cloneWithAdjustedRange(slot.isReserved() ? -group : group, prepend ? numberOfAddedSlots : 0, prepend ? 0 : numberOfAddedSlots, true);
        }
        if (!view.isRoot()) {
            view.sizeDelta += numberOfAddedSlots;
            view.slotsDelta += numberOfAddedSlots;
        }
        if (numberOfAddedSlots === increaseBy) {
            return Collector.one(slot.slots);
        }
    }
    return increaseUpperCapacity(state, increaseBy, numberOfAddedSlots, prepend);
}
exports.increaseCapacity = increaseCapacity;
function increaseUpperCapacity(state, increaseBy, numberOfAddedSlots, prepend) {
    var view = prepend ? state.left : state.right;
    var slot = view.slot;
    var collector = Collector.default((numberOfAddedSlots > 0 ? 1 : 0) + common_1.shiftDownRoundUp(increaseBy - numberOfAddedSlots, 5), prepend);
    if (numberOfAddedSlots > 0) {
        if (prepend) {
            collector.index--;
            collector.mark();
        }
        collector.set(slot.slots);
        if (prepend) {
            collector.restore();
        }
    }
    var expand = slot_1.ExpansionParameters.get(0, 0, 0);
    var shift = 0, level = 0;
    var remainingSize = increaseBy - numberOfAddedSlots;
    var worker = traversal_1.TreeWorker.defaultPrimary().reset(state, view, state.group, 0);
    do {
        shift += 5;
        numberOfAddedSlots = calculateSlotsToAdd(view.isRoot() ? 1 : view.parent.slotCount(), common_1.shiftDownRoundUp(remainingSize, shift));
        expand.sizeDelta = functions_1.min(remainingSize, numberOfAddedSlots << shift);
        remainingSize -= expand.sizeDelta;
        if (prepend) {
            expand.padLeft = numberOfAddedSlots;
        }
        else {
            expand.padRight = numberOfAddedSlots;
        }
        var ascendMode = worker.hasOtherView() && worker.other.slot.isReserved() && view.isRoot() ? 1 : 3;
        view = worker.ascend(ascendMode, expand);
        if (numberOfAddedSlots && (prepend && view.anchor === 0) || (!prepend && view.anchor === 1)) {
            view.flipAnchor(state.size);
        }
        if (prepend) {
            collector.index -= common_1.shiftDownRoundUp(expand.sizeDelta, 5);
            collector.mark();
        }
        level++;
        if (numberOfAddedSlots > 0) {
            populateSubtrees(state, collector, view, level, prepend ? -numberOfAddedSlots : view.slotCount() - numberOfAddedSlots, expand.sizeDelta + remainingSize, remainingSize === 0);
            if (prepend) {
                collector.restore();
            }
        }
    } while (remainingSize > 0);
    if (view.isRoot()) {
        view.sizeDelta = 0;
        view.slotsDelta = 0;
    }
    worker.dispose();
    return collector;
}
function populateSubtrees(state, collector, view, topLevelIndex, slotIndexBoundary, capacity, isFinalStage) {
    var levelIndex = topLevelIndex - 1;
    var remaining = capacity;
    var shift = 5 * topLevelIndex;
    var slot = view.slot;
    var slots = slot.slots;
    var prepend = slotIndexBoundary < 0;
    var slotCount = prepend ? -slotIndexBoundary : slot.slots.length;
    var slotIndex = prepend ? 0 : slotIndexBoundary;
    var slotIndices = new Array(topLevelIndex);
    var slotCounts = new Array(topLevelIndex);
    var slotPath = new Array(topLevelIndex);
    var group = state.group;
    var delta = 0, subcount = 0;
    var isEdge;
    slotIndices[levelIndex] = slotIndex;
    slotCounts[levelIndex] = slotCount;
    slotPath[levelIndex] = slot;
    do {
        if (slotIndex === slotCount) {
            isEdge = isFinalStage && ((prepend && remaining === capacity - slot.size) || (remaining === 0 && (!prepend || levelIndex >= topLevelIndex)));
            if (levelIndex === 0) {
                slot.subcount += subcount;
            }
            levelIndex++;
            if (levelIndex < topLevelIndex) {
                slotIndex = ++slotIndices[levelIndex];
                subcount = slotCount;
                slotCount = slotCounts[levelIndex];
                shift += 5;
                slot = slotPath[levelIndex];
                slot.subcount += subcount;
                slots = slot.slots;
            }
        }
        else {
            if (levelIndex === 0) {
                isEdge = isFinalStage && ((prepend && capacity === remaining) || (!prepend && remaining <= 32));
                var elementCount = isEdge ? (remaining & 31) || 32 : functions_1.min(remaining, 32);
                var leafSlots = new Array(elementCount);
                collector.set(leafSlots);
                var leafSlot = new slot_1.Slot(group, elementCount, 0, -1, 0, leafSlots);
                slots[slotIndex] = leafSlot;
                if (isEdge) {
                    if (prepend && elementCount < 32 && slots.length > 1) {
                        view.slot.recompute = view.slotCount();
                    }
                    view.slot.slots[slotIndex] = leafSlot.cloneAsPlaceholder(group);
                    view = view_1.View.create(group, 0, prepend ? 0 : 1, slotIndex, 0, 0, view, leafSlot);
                    view.slot.group = -group;
                    state_1.setView(state, view);
                }
                remaining -= elementCount;
                delta += elementCount;
                subcount += elementCount;
                slotIndex++;
            }
            else {
                isEdge = isFinalStage && ((prepend && capacity === remaining) || (!prepend && slotIndex === slots.length - 1 && remaining <= (1 << shift)));
                shift -= 5;
                delta = 0;
                subcount = 0;
                levelIndex--;
                var size = isEdge && common_1.modulo(remaining, shift) || functions_1.min(remaining, 32 << shift);
                if (prepend && isEdge && slots.length > 1 && size < 32 << shift) {
                    slot.recompute = slots.length;
                }
                slotCount = common_1.shiftDownRoundUp(size, shift);
                slot = new slot_1.Slot(group, size, 0, -1, 0, new Array(slotCount));
                slotPath[levelIndex] = slot;
                if (isEdge) {
                    view = view_1.View.create(group, 0, prepend ? 0 : 1, slotIndex, 0, 0, view, slot);
                    slots[slotIndex] = slot.cloneAsPlaceholder(group);
                    slot.group = -group;
                }
                else {
                    slots[slotIndex] = slot;
                }
                slots = slot.slots;
                slotCounts[levelIndex] = slotCount;
                slotIndex = 0;
                slotIndices[levelIndex] = slotIndex;
            }
        }
    } while (levelIndex < topLevelIndex);
}
function calculateSlotsToAdd(initialSlotCount, totalAdditionalSlots) {
    return functions_1.min(32 - initialSlotCount, totalAdditionalSlots);
}

//# sourceMappingURL=capacity.js.map
