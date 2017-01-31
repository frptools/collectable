"use strict";
var functions_1 = require("../shared/functions");
var array_1 = require("../shared/array");
var ownership_1 = require("../shared/ownership");
var common_1 = require("./common");
var state_1 = require("./state");
var capacity_1 = require("./capacity");
var slice_1 = require("./slice");
var concat_1 = require("./concat");
var traversal_1 = require("./traversal");
function setValueAtOrdinal(state, ordinal, value) {
    ordinal = common_1.verifyIndex(state.size, ordinal);
    if (ordinal === -1) {
        throw new Error("Index " + ordinal + " is out of range");
    }
    var view = traversal_1.TreeWorker.focusOrdinal(state, ordinal, true);
    if (!view.slot.isEditable(state.group)) {
        view.slot = view.slot.cloneToGroup(state.group, true);
    }
    var index = traversal_1.getLeafIndex(view, ordinal, state.size);
    view.slot.slots[index] = value;
}
exports.setValueAtOrdinal = setValueAtOrdinal;
function appendValues(state, values) {
    var tail = traversal_1.TreeWorker.focusTail(state, true);
    var innerIndex = tail.slot.size % 32;
    capacity_1.increaseCapacity(state, values.length, false).populate(values, innerIndex);
    state.lastWrite = 1;
    return state;
}
exports.appendValues = appendValues;
function prependValues(state, values) {
    traversal_1.TreeWorker.focusHead(state, true);
    capacity_1.increaseCapacity(state, values.length, true).populate(values, 0);
    state.lastWrite = 0;
    return state;
}
exports.prependValues = prependValues;
function insertValues(state, ordinal, values) {
    ordinal = common_1.normalizeIndex(state.size, ordinal);
    if (ordinal === 0)
        return prependValues(state, values);
    if (ordinal >= state.size)
        return appendValues(state, values);
    var right = state_1.cloneState(state, ownership_1.nextId(), true);
    slice_1.sliceList(right, ordinal, right.size);
    slice_1.sliceList(state, 0, ordinal);
    appendValues(state, values);
    return concat_1.concatLists(state, right);
}
exports.insertValues = insertValues;
function deleteValues(state, start, end) {
    start = common_1.normalizeIndex(state.size, start);
    end = common_1.normalizeIndex(state.size, end);
    if (start >= end)
        return state;
    if (start === 0 || end === state.size) {
        if (end - start === state.size) {
            return state_1.emptyState(ownership_1.isMutable(state.owner));
        }
        if (start > 0) {
            slice_1.sliceList(state, 0, start);
        }
        else {
            slice_1.sliceList(state, end, state.size);
        }
        return state;
    }
    var right = state_1.cloneState(state, ownership_1.nextId(), true);
    slice_1.sliceList(state, 0, start);
    slice_1.sliceList(right, end, right.size);
    state = concat_1.concatLists(state, right);
    return state;
}
exports.deleteValues = deleteValues;
var ListIterator = (function () {
    function ListIterator(_state) {
        this._state = _state;
        this._index = 0;
    }
    ListIterator.prototype.next = function () {
        if (this._index >= this._state.size) {
            return { value: void 0, done: true };
        }
        return {
            value: traversal_1.getAtOrdinal(this._state, this._index++),
            done: false
        };
    };
    ListIterator.prototype[Symbol.iterator] = function () {
        return new ListIterator(this._state);
    };
    return ListIterator;
}());
exports.ListIterator = ListIterator;
function createIterator(state) {
    return new ListIterator(state);
}
exports.createIterator = createIterator;
function createArray(state) {
    var map = new Map();
    var _a = getRoot(state, map), root = _a[0], depth = _a[1];
    if (depth === 0) {
        return array_1.copyArray(root.slots);
    }
    var array = new Array(state.size);
    populateArray(array, root, map, depth - 1, 0);
    return array;
}
exports.createArray = createArray;
function getRoot(state, map) {
    var left = state.left;
    var right = state.right;
    var root = void 0;
    var depth = 0;
    if (left.isNone()) {
        if (right.isRoot()) {
            return [right.slot, 0];
        }
    }
    else {
        if (right.isNone() && left.isRoot()) {
            return [left.slot, 0];
        }
        _a = populateViewMap(left, map), root = _a[0], depth = _a[1];
    }
    if (!right.isNone()) {
        _b = populateViewMap(right, map), root = _b[0], depth = _b[1];
    }
    return [root, depth];
    var _a, _b;
}
function populateViewMap(view, map) {
    var root, depth = 0;
    do {
        addViewToMap(view, map);
        root = view.slot;
        view = view.parent;
        depth++;
    } while (!view.isNone());
    return [root, depth];
}
function addViewToMap(view, map) {
    var item = map.get(view.parent.slot);
    if (functions_1.isUndefined(item)) {
        item = new Map();
        map.set(view.parent.slot, item);
    }
    item.set(view.slotIndex, view.slot);
}
function getSlotFromMap(map, slot, slotIndex) {
    var item = map.get(slot);
    return item && item.get(slotIndex);
}
function populateArray(array, node, map, level, offset) {
    var slots = node.slots;
    for (var i = 0, c = 0; i < slots.length; i++) {
        var child = getSlotFromMap(map, node, i) || slots[i];
        if (level === 1) {
            var elements = child.slots;
            array_1.blockCopy(elements, array, 0, offset + c, elements.length);
            c += elements.length;
        }
        else {
            c += populateArray(array, child, map, level - 1, offset + c);
        }
    }
    return c;
}

//# sourceMappingURL=values.js.map
