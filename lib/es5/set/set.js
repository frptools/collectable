"use strict";
var ownership_1 = require("../shared/ownership");
var functions_1 = require("../shared/functions");
var common_1 = require("../shared/common");
function clone(state, mutable) {
    if (mutable === void 0) { mutable = false; }
    return {
        set: new Set(state.set),
        owner: mutable ? ownership_1.batch.owner || -1 : 0,
        group: ownership_1.nextId()
    };
}
function createSet() {
    return new PersistentSet({
        set: new Set(),
        group: ownership_1.nextId(),
        owner: ownership_1.batch.owner
    });
}
var PersistentSet = (function () {
    function PersistentSet(state) {
        this._serializing = void 0;
        this._state = state;
    }
    PersistentSet.create = function (create) {
        if (functions_1.isUndefined(create)) {
            return createSet();
        }
        return ownership_1.batch(function (owner) {
            var set = createSet();
            return create(set) || set;
        });
    };
    PersistentSet.empty = function () {
        return ownership_1.batch.active ? PersistentSet.create() : PersistentSet._empty;
    };
    PersistentSet.prototype.prep = function () {
        return ownership_1.isMutable(this._state.owner) ? this : this.clone();
    };
    Object.defineProperty(PersistentSet.prototype, "size", {
        get: function () {
            return this._state.set.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PersistentSet.prototype, "mutable", {
        get: function () {
            return ownership_1.isMutable(this._state.owner);
        },
        enumerable: true,
        configurable: true
    });
    PersistentSet.prototype.batch = function (callback) {
        ownership_1.batch.start();
        var set = this.asMutable();
        set = callback(set) || set;
        if (ownership_1.batch.end()) {
            set._state.owner = 0;
        }
        return set;
    };
    PersistentSet.prototype.asMutable = function () {
        return ownership_1.isMutable(this._state.owner) ? this : new PersistentSet(clone(this._state, true));
    };
    PersistentSet.prototype.asImmutable = function () {
        return ownership_1.isMutable(this._state.owner) ? new PersistentSet(clone(this._state, false)) : this;
    };
    PersistentSet.prototype.clone = function () {
        return new PersistentSet(clone(this._state));
    };
    PersistentSet.prototype.add = function (value) {
        var set = this.prep();
        set._state.set.add(value);
        return set;
    };
    PersistentSet.prototype.remove = function (value) {
        var set = this.prep();
        set._state.set.delete(value);
        return set;
    };
    PersistentSet.prototype.has = function (value) {
        return this._state.set.has(value);
    };
    PersistentSet.prototype.toArray = function () {
        var i = 0, array = new Array(this.size);
        for (var it = this.values(), current = it.next(); !current.done; current = it.next()) {
            array[i++] = current.value;
        }
        return array;
    };
    PersistentSet.prototype.values = function () {
        return this._state.set.values();
    };
    PersistentSet.prototype[Symbol.iterator] = function () {
        return this._state.set[Symbol.iterator]();
    };
    PersistentSet.prototype.toJS = function () {
        if (functions_1.isDefined(this._serializing)) {
            return this._serializing;
        }
        var i = 0, array = new Array(this.size);
        this._serializing = array;
        for (var it = this.values(), current = it.next(); !current.done; current = it.next()) {
            var value = current.value;
            array[i++] = common_1.isIterable(value) ? value.toJS() : value;
        }
        this._serializing = void 0;
        return array;
    };
    return PersistentSet;
}());
PersistentSet._empty = PersistentSet.create();
exports.PersistentSet = PersistentSet;

//# sourceMappingURL=set.js.map
