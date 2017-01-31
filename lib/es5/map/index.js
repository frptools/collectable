"use strict";
var map_1 = require("./map");
exports.PersistentMap = map_1.PersistentMap;
var state_1 = require("./state");
exports.MapState = state_1.MapState;
var ownership_1 = require("../shared/ownership");
var deep_1 = require("../shared/deep");
var functions_1 = require("../shared/functions");
var common_1 = require("../shared/common");
var state_2 = require("./state");
var _empty = state_2.emptyState();
function prep(map) {
    return ownership_1.isMutable(map.owner) ? map : state_2.cloneState(map);
}
function emptyMap() {
    return ownership_1.batch.active ? state_2.createState() : _empty;
}
exports.emptyMap = emptyMap;
function isMap(collection) {
    return collection instanceof state_2.MapState;
}
exports.isMap = isMap;
function isEmpty(map) {
    return map.values.size === 0;
}
exports.isEmpty = isEmpty;
function isEqual(a, b) {
    if (a === b)
        return true;
    if (getSize(a) !== getSize(b))
        return false;
    var bvalues = b.values;
    var it = a.values.entries();
    for (var current = it.next(); !current.done; current = it.next()) {
        var entry = current.value;
        if (!bvalues.has(entry[0]))
            return false;
        if (entry[1] !== bvalues.get(entry[0]))
            return false;
    }
    return true;
}
exports.isEqual = isEqual;
function getSize(map) {
    return map.values.size;
}
exports.getSize = getSize;
function isMutable(map) {
    return ownership_1.isMutable(map.owner);
}
exports.isMutable = isMutable;
function updateMap(callback, map) {
    ownership_1.batch.start();
    map = asMutable(map);
    map = callback(map) || map;
    if (ownership_1.batch.end()) {
        map.owner = 0;
    }
    return map;
}
exports.updateMap = updateMap;
function asMutable(map) {
    return ownership_1.isMutable(map.owner) ? map : state_2.cloneState(map, true);
}
exports.asMutable = asMutable;
function asImmutable(map) {
    return ownership_1.isMutable(map.owner) ? state_2.cloneState(map, false) : map;
}
exports.asImmutable = asImmutable;
function update(key, callback, map) {
    var oldv = get(key, map);
    var newv = callback(oldv);
    return newv === oldv ? map
        : newv === void 0 ? remove(key, map)
            : set(key, newv, map);
}
exports.update = update;
function get(key, map) {
    return map.values.get(key);
}
exports.get = get;
function getIn(path, map) {
    return deep_1.getDeep(map, path);
}
exports.getIn = getIn;
function set(key, value, map) {
    if (get(key, map) === value)
        return map;
    map = prep(map);
    if (functions_1.isDefined(value)) {
        map.values.set(key, value);
    }
    else {
        map.values.delete(key);
    }
    return map;
}
exports.set = set;
exports.assoc = set;
function setIn(path, value, map) {
    return deep_1.setDeep(map, path, 0, value);
}
exports.setIn = setIn;
function has(key, map) {
    return map.values.has(key);
}
exports.has = has;
function hasIn(path, map) {
    return deep_1.hasDeep(map, path);
}
exports.hasIn = hasIn;
function remove(key, map) {
    if (!has(key, map))
        return map;
    map = prep(map);
    map.values.delete(key);
    return map;
}
exports.remove = remove;
function keys(map) {
    return map.values.keys();
}
exports.keys = keys;
function values(map) {
    return map.values.values();
}
exports.values = values;
function entries(map) {
    return map.values.entries();
}
exports.entries = entries;
function toIterable(map) {
    return map.values[Symbol.iterator]();
}
exports.toIterable = toIterable;
var _serializing = void 0;
function toJS(map) {
    if (functions_1.isDefined(_serializing)) {
        return _serializing;
    }
    var obj = {};
    _serializing = obj;
    for (var it = map.values.entries(), current = it.next(); !current.done; current = it.next()) {
        var entry = current.value;
        var value = entry[1];
        obj[entry[0]] = common_1.isIterable(value) ? value.toJS() : value;
    }
    _serializing = void 0;
    return obj;
}
exports.toJS = toJS;

//# sourceMappingURL=index.js.map
