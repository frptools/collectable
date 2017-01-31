"use strict";
var ownership_1 = require("../shared/ownership");
var deep_1 = require("../shared/deep");
var values_1 = require("./values");
var traversal_1 = require("./traversal");
var state_1 = require("./state");
var List = require("./index");
var PersistentList = (function () {
    function PersistentList(_state) {
        this._state = _state;
    }
    PersistentList.empty = function () {
        return exports._emptyList;
    };
    PersistentList.fromArray = function (values) {
        return new PersistentList(List.fromArray(values));
    };
    Object.defineProperty(PersistentList.prototype, "size", {
        get: function () {
            return this._state.size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PersistentList.prototype, "mutable", {
        get: function () {
            return ownership_1.isMutable(this._state.owner);
        },
        enumerable: true,
        configurable: true
    });
    PersistentList.prototype.hasIndex = function (index) {
        return List.hasIndex(index, this._state);
    };
    PersistentList.prototype.hasIn = function (path) {
        return deep_1.hasDeep(this._state, path);
    };
    PersistentList.prototype.batch = function (callback) {
        ownership_1.batch.start();
        var list = this.asMutable();
        callback(list);
        if (ownership_1.batch.end()) {
            list._state.owner = 0;
        }
        return list;
    };
    PersistentList.prototype.asMutable = function () {
        return ownership_1.isMutable(this._state.owner) ? this : new PersistentList(state_1.ensureMutable(this._state));
    };
    PersistentList.prototype.asImmutable = function () {
        return ownership_1.isMutable(this._state.owner) ? new PersistentList(state_1.ensureImmutable(this._state, false)) : this;
    };
    PersistentList.prototype.freeze = function () {
        return ownership_1.isMutable(this._state.owner)
            ? (state_1.ensureImmutable(this._state, true), this)
            : this;
    };
    PersistentList.prototype.thaw = function () {
        if (!ownership_1.isMutable(this._state.owner)) {
            this._state.owner = -1;
        }
        return this;
    };
    PersistentList.prototype.update = function (index, callback) {
        var state = List.updateIndex(index, callback, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.get = function (index) {
        return traversal_1.getAtOrdinal(this._state, index);
    };
    PersistentList.prototype.getIn = function (path) {
        return deep_1.getDeep(this._state, path);
    };
    PersistentList.prototype.set = function (index, value) {
        var state = List.set(index, value, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.setIn = function (path, value) {
        var state = deep_1.setDeep(this._state, path, 0, value);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.append = function () {
        if (arguments.length === 0)
            return this;
        var state = arguments.length === 1
            ? List.append(arguments[0], this._state)
            : List.appendArray(Array.from(arguments), this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.appendArray = function (values) {
        var state = List.appendArray(values, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.prepend = function () {
        if (arguments.length === 0)
            return this;
        var state = arguments.length === 1
            ? List.prepend(arguments[0], this._state)
            : List.prependArray(Array.from(arguments), this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.prependArray = function (values) {
        var state = List.prependArray(values, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.insert = function (index) {
        if (arguments.length <= 1)
            return this;
        var values = new Array(arguments.length - 1);
        for (var i = 1; i < arguments.length; i++) {
            values[i - 1] = arguments[i];
        }
        var state = List.insertArray(index, values, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.insertArray = function (index, values) {
        if (values.length === 0)
            return this;
        var state = List.insertArray(index, values, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.delete = function (index) {
        var state = List.remove(index, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.deleteRange = function (start, end) {
        var state = List.removeRange(start, end, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.pop = function () {
        var state = List.pop(this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.popFront = function () {
        var state = List.popFront(this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.skip = function (count) {
        var state = List.skip(count, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.take = function (count) {
        var state = List.take(count, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.slice = function (start, end) {
        if (end === void 0) { end = 0; }
        var state = List.slice(start, end, this._state);
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.concat = function (list) {
        if (arguments.length === 0)
            return this;
        var state = arguments.length === 1
            ? List.concat(this._state, list._state)
            : List.concatMany([this._state].concat(Array.from(arguments).map(function (arg) { return arg._state; })));
        return state === this._state ? this : new PersistentList(state);
    };
    PersistentList.prototype.toArray = function () {
        return values_1.createArray(this._state);
    };
    PersistentList.prototype[Symbol.iterator] = function () {
        return values_1.createIterator(this._state);
    };
    PersistentList.prototype.values = function () {
        return values_1.createIterator(this._state);
    };
    PersistentList.prototype.toJS = function () {
        return this.toArray();
    };
    return PersistentList;
}());
exports.PersistentList = PersistentList;
function isDefaultEmptyList(list) {
    return list === exports._emptyList;
}
exports.isDefaultEmptyList = isDefaultEmptyList;
exports._emptyList = new PersistentList(state_1.emptyState(false));

//# sourceMappingURL=list.js.map
