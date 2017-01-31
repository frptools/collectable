"use strict";
var ownership_1 = require("../shared/ownership");
var deep_1 = require("../shared/deep");
var functions_1 = require("../shared/functions");
var common_1 = require("../shared/common");
var state_1 = require("./state");
function createMap() {
    return new PersistentMap(state_1.createState());
}
var PersistentMap = (function () {
    function PersistentMap(state) {
        this._serializing = void 0;
        this._state = state;
    }
    PersistentMap.create = function (create) {
        if (functions_1.isUndefined(create)) {
            return createMap();
        }
        return ownership_1.batch(function (owner) {
            var map = createMap();
            return create(map) || map;
        });
    };
    PersistentMap.empty = function () {
        return ownership_1.batch.active ? PersistentMap.create() : PersistentMap._empty;
    };
    PersistentMap.prototype.prep = function () {
        return ownership_1.isMutable(this._state.owner) ? this : this.clone();
    };
    Object.defineProperty(PersistentMap.prototype, "size", {
        get: function () {
            return this._state.values.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PersistentMap.prototype, "mutable", {
        get: function () {
            return ownership_1.isMutable(this._state.owner);
        },
        enumerable: true,
        configurable: true
    });
    PersistentMap.prototype.batch = function (callback) {
        ownership_1.batch.start();
        var map = this.asMutable();
        map = callback(map) || map;
        if (ownership_1.batch.end()) {
            map._state.owner = 0;
        }
        return map;
    };
    PersistentMap.prototype.asMutable = function () {
        return ownership_1.isMutable(this._state.owner) ? this : new PersistentMap(state_1.cloneState(this._state, true));
    };
    PersistentMap.prototype.asImmutable = function () {
        return ownership_1.isMutable(this._state.owner) ? new PersistentMap(state_1.cloneState(this._state, false)) : this;
    };
    PersistentMap.prototype.update = function (key, callback) {
        var oldv = this.get(key);
        var newv = callback(oldv);
        return newv === oldv ? this : this.set(key, newv);
    };
    PersistentMap.prototype.clone = function () {
        return new PersistentMap(state_1.cloneState(this._state));
    };
    PersistentMap.prototype.get = function (key) {
        return this._state.values.get(key);
    };
    PersistentMap.prototype.getIn = function (path) {
        return deep_1.getDeep(this._state, path);
    };
    PersistentMap.prototype.set = function (key, value) {
        var map = this.prep();
        map._state.values.set(key, value);
        return map;
    };
    PersistentMap.prototype.setIn = function (path, value) {
        return new PersistentMap(deep_1.setDeep(this._state, path, 0, value));
    };
    PersistentMap.prototype.has = function (key) {
        return this._state.values.has(key);
    };
    PersistentMap.prototype.hasIn = function (path) {
        return deep_1.hasDeep(this._state, path);
    };
    PersistentMap.prototype.delete = function (key) {
        var map = this.prep();
        map._state.values.delete(key);
        return map;
    };
    PersistentMap.prototype.keys = function () {
        return this._state.values.keys();
    };
    PersistentMap.prototype.values = function () {
        return this._state.values.values();
    };
    PersistentMap.prototype.entries = function () {
        return this._state.values.entries();
    };
    PersistentMap.prototype[Symbol.iterator] = function () {
        return this._state.values[Symbol.iterator]();
    };
    PersistentMap.prototype.toJS = function () {
        if (functions_1.isDefined(this._serializing)) {
            return this._serializing;
        }
        var obj = {};
        this._serializing = obj;
        for (var it = this.entries(), current = it.next(); !current.done; current = it.next()) {
            var entry = current.value;
            var value = entry[1];
            obj[entry[0]] = common_1.isIterable(value) ? value.toJS() : value;
        }
        this._serializing = void 0;
        return obj;
    };
    return PersistentMap;
}());
PersistentMap._empty = PersistentMap.create();
exports.PersistentMap = PersistentMap;

//# sourceMappingURL=map.js.map
