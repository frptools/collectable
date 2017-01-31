"use strict";
const functions_1 = require("./functions");
const list_1 = require("../list");
const map_1 = require("../map");
const set_1 = require("../set");
function isList(arg) {
    return arg instanceof list_1.ListState;
}
function isMap(arg) {
    return arg instanceof map_1.MapState;
}
function isSet(arg) {
    return arg instanceof set_1.SetState;
}
function isCollectionType(arg) {
    if (!arg || typeof arg !== 'object')
        return false;
    return isList(arg) || isMap(arg) || isSet(arg);
}
function isDeepCollectionType(arg) {
    if (!arg || typeof arg !== 'object')
        return false;
    return isList(arg) || isMap(arg);
}
function ensureNumericIndex(arg) {
    if (typeof arg !== 'number') {
        throw new Error('List can only be indexed using a numeric value');
    }
    return arg;
}
function isEqual(a, b) {
    if (a === b)
        return true;
    if (!a || typeof a !== 'object')
        return false;
    if (isList(a)) {
        if (!isList(b))
            return false;
        return isListEqual(a, b);
    }
    if (isMap(a)) {
        if (!isMap(b))
            return false;
        return isMapEqual(a, b);
    }
    if (isSet(a)) {
        if (!isSet(b))
            return false;
        return isSetEqual(a, b);
    }
    return false;
}
exports.isEqual = isEqual;
function isListEqual(a, b) {
    if (list_1.getSize(a) !== list_1.getSize(b))
        return false;
    var it = list_1.toIterable(a);
    for (var current = it.next(); !current.done; current = it.next()) {
        var entry = current.value;
        if (!isEqual(entry[1], list_1.get(entry[0], b)))
            return false;
    }
    return true;
}
function isMapEqual(a, b) {
    if (map_1.getSize(a) !== map_1.getSize(b))
        return false;
    var it = map_1.toIterable(a);
    for (var current = it.next(); !current.done; current = it.next()) {
        var entry = current.value;
        if (!map_1.has(entry[0], b))
            return false;
        if (!isEqual(entry[1], map_1.get(entry[0], b)))
            return false;
    }
    return true;
}
function isSetEqual(a, b) {
    if (set_1.getSize(a) !== set_1.getSize(b))
        return false;
    var it = set_1.toIterable(a);
    for (var current = it.next(); !current.done; current = it.next()) {
        if (!set_1.has(current.value, b))
            return false;
    }
    return true;
}
function getDeep(collection, path) {
    var i = 0, value = collection;
    while (value !== void 0 && i < path.length) {
        if (isDeepCollectionType(value)) {
            if (isMap(value)) {
                value = map_1.get(path[i], value);
            }
            else if (isList(value)) {
                if (typeof path[i] === 'number') {
                    value = list_1.get(path[i], value);
                }
                else {
                    value = void 0;
                }
            }
            i++;
        }
        else {
            value = void 0;
        }
    }
    return value;
}
exports.getDeep = getDeep;
function hasDeep(collection, path) {
    var i = 0, value = collection;
    while (i < path.length && value !== void 0) {
        if (isCollectionType(value)) {
            if (isMap(value)) {
                value = map_1.get(path[i], value);
            }
            else if (isList(value)) {
                var index = path[i];
                if (typeof index !== 'number' || !list_1.hasIndex(index, value)) {
                    return false;
                }
                value = list_1.get(path[i], value);
            }
            else {
                if (i === path.length - 1) {
                    if (value === path[i]) {
                        return true;
                    }
                    if (isSet(value)) {
                        return set_1.has(path[i], value);
                    }
                }
                return false;
            }
            if (functions_1.isUndefined(value)) {
                return false;
            }
            i++;
        }
        else {
            return false;
        }
    }
    return functions_1.isDefined(value);
}
exports.hasDeep = hasDeep;
function setDeep(collection, path, keyidx, value) {
    var key = path[keyidx], value = collection;
    if (keyidx === path.length - 1) {
        if (functions_1.isDefined(collection)) {
            if (isMap(collection))
                return map_1.set(key, value, collection);
            if (isList(collection))
                return list_1.set(ensureNumericIndex(key), value, collection);
        }
        return map_1.set(key, value, map_1.emptyMap());
    }
    if (functions_1.isDefined(collection)) {
        if (isMap(collection)) {
            return map_1.set(key, setDeep(map_1.get(key, collection), path, keyidx + 1, value), collection);
        }
        if (isList(collection)) {
            var index = ensureNumericIndex(key);
            return list_1.set(index, setDeep(list_1.get(index, collection), path, index + 1, value), collection);
        }
    }
    return map_1.set(key, setDeep(void 0, path, keyidx + 1, value), map_1.emptyMap());
}
exports.setDeep = setDeep;

//# sourceMappingURL=deep.js.map
