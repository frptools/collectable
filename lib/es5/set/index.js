"use strict";
var set_1 = require("./set");
exports.PersistentSet = set_1.PersistentSet;
var state_1 = require("./state");
exports.SetState = state_1.SetState;
var ownership_1 = require("../shared/ownership");
var functions_1 = require("../shared/functions");
var common_1 = require("../shared/common");
var state_2 = require("./state");
var _empty = state_2.emptyState();
function prep(set) {
    return ownership_1.isMutable(set.owner) ? set : state_2.cloneState(set);
}
function emptySet() {
    return ownership_1.batch.active ? state_2.createState() : _empty;
}
exports.emptySet = emptySet;
function fromArray(values) {
    if (!Array.isArray(values)) {
        throw new Error('First argument must be an array of values');
    }
    return state_2.createState(values);
}
exports.fromArray = fromArray;
function getSize(set) {
    return set.values.size;
}
exports.getSize = getSize;
function isEmpty(set) {
    return set.values.size === 0;
}
exports.isEmpty = isEmpty;
function isMutable(set) {
    return ownership_1.isMutable(set.owner);
}
exports.isMutable = isMutable;
function updateSet(callback, set) {
    ownership_1.batch.start();
    set = asMutable(set);
    set = callback(set) || set;
    if (ownership_1.batch.end()) {
        set.owner = 0;
    }
    return set;
}
exports.updateSet = updateSet;
function asMutable(set) {
    return ownership_1.isMutable(set.owner) ? set : state_2.cloneState(set, true);
}
exports.asMutable = asMutable;
function asImmutable(set) {
    return ownership_1.isMutable(set.owner) ? state_2.cloneState(set, false) : set;
}
exports.asImmutable = asImmutable;
function add(value, set) {
    if (has(value, set))
        return set;
    set = prep(set);
    if (functions_1.isDefined(value)) {
        set.values.add(value);
    }
    else {
        set.values.delete(value);
    }
    return set;
}
exports.add = add;
function has(value, set) {
    return set.values.has(value);
}
exports.has = has;
function remove(value, set) {
    if (!has(value, set))
        return set;
    set = prep(set);
    set.values.delete(value);
    return set;
}
exports.remove = remove;
function values(set) {
    return set.values.values();
}
exports.values = values;
function toIterable(set) {
    return set.values[Symbol.iterator]();
}
exports.toIterable = toIterable;
var _serializing = void 0;
function toJS(set) {
    if (functions_1.isDefined(_serializing)) {
        return _serializing;
    }
    var obj = {};
    _serializing = obj;
    for (var it = set.values.entries(), current = it.next(); !current.done; current = it.next()) {
        var entry = current.value;
        var value = entry[1];
        obj[entry[0]] = common_1.isIterable(value) ? value.toJS() : value;
    }
    _serializing = void 0;
    return obj;
}
exports.toJS = toJS;

//# sourceMappingURL=index.js.map
