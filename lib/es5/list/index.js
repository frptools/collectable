"use strict";
var list_1 = require("./list");
exports.PersistentList = list_1.PersistentList;
var state_1 = require("./state");
exports.ListState = state_1.ListState;
var ownership_1 = require("../shared/ownership");
var functions_1 = require("../shared/functions");
var deep_1 = require("../shared/deep");
var common_1 = require("./common");
var values_1 = require("./values");
var traversal_1 = require("./traversal");
var concat_1 = require("./concat");
var slice_1 = require("./slice");
var state_2 = require("./state");
var _empty = state_2.emptyState(false);
function emptyList() {
    return _empty;
}
exports.emptyList = emptyList;
function isList(collection) {
    return collection instanceof state_2.ListState;
}
exports.isList = isList;
function isEmpty(list) {
    return list.size === 0;
}
exports.isEmpty = isEmpty;
function fromArray(values) {
    if (!Array.isArray(values)) {
        throw new Error('First argument must be an array of values');
    }
    var state = state_2.emptyState(true);
    if (values.length > 0) {
        values_1.appendValues(state, values);
    }
    return state_2.ensureImmutable(state, true);
}
exports.fromArray = fromArray;
function _exec(state, fn) {
    var immutable = !ownership_1.isMutable(state.owner);
    if (immutable) {
        state = state_2.ensureMutable(state);
    }
    var nextState = fn(state);
    if (functions_1.isDefined(nextState)) {
        if (immutable) {
            state = nextState;
        }
        else {
            state = nextState;
        }
    }
    return immutable ? state_2.ensureImmutable(state, true) : state;
}
exports._exec = _exec;
function getSize(list) {
    return list.size;
}
exports.getSize = getSize;
function hasIndex(index, list) {
    return common_1.verifyIndex(list.size, index) !== -1;
}
exports.hasIndex = hasIndex;
function hasIn(path, list) {
    return deep_1.hasDeep(list, path);
}
exports.hasIn = hasIn;
function asMutable(list) {
    return ownership_1.isMutable(list.owner) ? list : state_2.ensureMutable(list);
}
exports.asMutable = asMutable;
function asImmutable(list) {
    return ownership_1.isMutable(list.owner) ? state_2.ensureImmutable(list, false) : list;
}
exports.asImmutable = asImmutable;
function freeze(list) {
    return ownership_1.isMutable(list.owner)
        ? (state_2.ensureImmutable(list, true), list)
        : list;
}
exports.freeze = freeze;
function thaw(list) {
    if (!ownership_1.isMutable(list.owner)) {
        list.owner = -1;
    }
    return list;
}
exports.thaw = thaw;
function updateList(callback, list) {
    ownership_1.batch.start();
    list = asMutable(list);
    callback(list);
    if (ownership_1.batch.end()) {
        list.owner = 0;
    }
    return list;
}
exports.updateList = updateList;
function updateIndex(index, callback, list) {
    var oldv = get(index, list);
    var newv = callback(oldv);
    return newv === oldv ? list : set(index, newv, list);
}
exports.updateIndex = updateIndex;
function get(index, list) {
    return traversal_1.getAtOrdinal(list, index);
}
exports.get = get;
function getIn(path, list) {
    return deep_1.getDeep(list, path);
}
exports.getIn = getIn;
function set(index, value, list) {
    return _exec(list, function (state) { return values_1.setValueAtOrdinal(state, index, value); });
}
exports.set = set;
function setIn(path, value, list) {
    return deep_1.setDeep(list, path, 0, value);
}
exports.setIn = setIn;
function append(value, list) {
    var immutable = !ownership_1.isMutable(list.owner);
    if (immutable) {
        list = state_2.ensureMutable(list);
    }
    var tail = list.right;
    var slot = tail.slot;
    if (tail.group !== 0 && tail.offset === 0 && slot.group !== 0 && slot.size < 32) {
        list.lastWrite = 1;
        list.size++;
        if (slot.group === list.group) {
            slot.adjustRange(0, 1, true);
        }
        else {
            slot = slot.cloneWithAdjustedRange(list.group, 0, 1, true, true);
            if (tail.group !== list.group) {
                tail = tail.cloneToGroup(list.group);
                list.right = tail;
            }
            tail.slot = slot;
        }
        tail.sizeDelta++;
        tail.slotsDelta++;
        slot.slots[slot.slots.length - 1] = arguments[0];
    }
    else {
        values_1.appendValues(list, [value]);
    }
    return immutable ? state_2.ensureImmutable(list, true) : list;
}
exports.append = append;
exports.push = append;
function appendArray(values, list) {
    return values.length === 0 ? list
        : _exec(list, function (state) { return values_1.appendValues(state, values); });
}
exports.appendArray = appendArray;
function prepend(value, list) {
    var immutable = !ownership_1.isMutable(list.owner);
    if (immutable) {
        list = state_2.ensureMutable(list);
    }
    var head = list.left;
    var slot = head.slot;
    if (head.group !== 0 && head.offset === 0 && slot.group !== 0 && slot.size < 32) {
        list.lastWrite = 0;
        list.size++;
        if (slot.group === list.group) {
            slot.adjustRange(1, 0, true);
        }
        else {
            slot = slot.cloneWithAdjustedRange(list.group, 1, 0, true, true);
            if (head.group !== list.group) {
                head = head.cloneToGroup(list.group);
                list.left = head;
            }
            head.slot = slot;
        }
        head.sizeDelta++;
        head.slotsDelta++;
        slot.slots[0] = arguments[0];
    }
    else {
        values_1.prependValues(list, [value]);
    }
    return immutable ? state_2.ensureImmutable(list, true) : list;
}
exports.prepend = prepend;
exports.unshift = prepend;
exports.cons = prepend;
function prependArray(values, list) {
    return values.length === 0 ? list
        : _exec(list, function (state) { return values_1.prependValues(state, values); });
}
exports.prependArray = prependArray;
function insert(index, value, list) {
    return _exec(list, function (state) { return values_1.insertValues(state, index, [value]); });
}
exports.insert = insert;
function insertArray(index, values, list) {
    if (values.length === 0)
        return list;
    return _exec(list, function (state) { return values_1.insertValues(state, index, values); });
}
exports.insertArray = insertArray;
function remove(index, list) {
    return list.size === 0 ? list
        : _exec(list, function (state) { return values_1.deleteValues(state, index, index + 1); });
}
exports.remove = remove;
function removeRange(start, end, list) {
    return list.size === 0 ? list
        : _exec(list, function (state) { return values_1.deleteValues(state, start, end); });
}
exports.removeRange = removeRange;
function pop(list) {
    return list.size === 0 ? list
        : _exec(list, function (state) { return slice_1.sliceList(state, 0, -1); });
}
exports.pop = pop;
function popFront(list) {
    return list.size === 0 ? list
        : _exec(list, function (state) { return slice_1.sliceList(state, 1, state.size); });
}
exports.popFront = popFront;
exports.shift = popFront;
function skip(count, list) {
    return list.size === 0 || count === 0 ? list
        : _exec(list, function (state) { return slice_1.sliceList(state, count, state.size); });
}
exports.skip = skip;
function take(count, list) {
    return list.size === 0 || count >= list.size ? list
        : _exec(list, function (state) { return slice_1.sliceList(state, 0, count); });
}
exports.take = take;
function slice(start, end, list) {
    if (end === 0)
        end = list.size;
    return list.size === 0 ? list
        : _exec(list, function (state) { return slice_1.sliceList(state, start, end); });
}
exports.slice = slice;
function concat(left, right) {
    return _exec(left, function (state) { return concat_1.concatLists(state, state_2.cloneState(right, ownership_1.nextId(), true)); });
}
exports.concat = concat;
function concatMany(lists) {
    var list = lists[0];
    var other;
    switch (lists.length) {
        case 1:
            other = lists[1];
            _exec(list, function (state) { return concat_1.concatLists(state, state_2.cloneState(other, ownership_1.nextId(), true)); });
        default:
            return _exec(list, function (state) {
                for (var i = 1; i < lists.length; i++) {
                    state = concat_1.concatLists(state, state_2.cloneState(lists[i], ownership_1.nextId(), true));
                }
                return state;
            });
    }
}
exports.concatMany = concatMany;
function toArray(list) {
    return values_1.createArray(list);
}
exports.toArray = toArray;
function join(separator, list) {
    return toArray(list).join(separator);
}
exports.join = join;
function toIterable(list) {
    return values_1.createIterator(list);
}
exports.toIterable = toIterable;
function toJS(list) {
    return toArray(list);
}
exports.toJS = toJS;
function isDefaultEmptyList(list) {
    return list === _empty;
}
exports.isDefaultEmptyList = isDefaultEmptyList;

//# sourceMappingURL=index.js.map
