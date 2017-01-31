"use strict";
const ownership_1 = require("../shared/ownership");
const deep_1 = require("../shared/deep");
const values_1 = require("./values");
const traversal_1 = require("./traversal");
const state_1 = require("./state");
const List = require("./index");
class PersistentList {
    constructor(_state) {
        this._state = _state;
    }
    static empty() {
        return exports._emptyList;
    }
    static fromArray(values) {
        return new PersistentList(List.fromArray(values));
    }
    get size() {
        return this._state.size;
    }
    get mutable() {
        return ownership_1.isMutable(this._state.owner);
    }
    hasIndex(index) {
        return List.hasIndex(index, this._state);
    }
    hasIn(path) {
        return deep_1.hasDeep(this._state, path);
    }
    batch(callback) {
        ownership_1.batch.start();
        var list = this.asMutable();
        callback(list);
        if (ownership_1.batch.end()) {
            list._state.owner = 0;
        }
        return list;
    }
    asMutable() {
        return ownership_1.isMutable(this._state.owner) ? this : new PersistentList(state_1.ensureMutable(this._state));
    }
    asImmutable() {
        return ownership_1.isMutable(this._state.owner) ? new PersistentList(state_1.ensureImmutable(this._state, false)) : this;
    }
    freeze() {
        return ownership_1.isMutable(this._state.owner)
            ? (state_1.ensureImmutable(this._state, true), this)
            : this;
    }
    thaw() {
        if (!ownership_1.isMutable(this._state.owner)) {
            this._state.owner = -1;
        }
        return this;
    }
    update(index, callback) {
        var state = List.updateIndex(index, callback, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    get(index) {
        return traversal_1.getAtOrdinal(this._state, index);
    }
    getIn(path) {
        return deep_1.getDeep(this._state, path);
    }
    set(index, value) {
        var state = List.set(index, value, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    setIn(path, value) {
        var state = deep_1.setDeep(this._state, path, 0, value);
        return state === this._state ? this : new PersistentList(state);
    }
    append() {
        if (arguments.length === 0)
            return this;
        var state = arguments.length === 1
            ? List.append(arguments[0], this._state)
            : List.appendArray(Array.from(arguments), this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    appendArray(values) {
        var state = List.appendArray(values, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    prepend() {
        if (arguments.length === 0)
            return this;
        var state = arguments.length === 1
            ? List.prepend(arguments[0], this._state)
            : List.prependArray(Array.from(arguments), this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    prependArray(values) {
        var state = List.prependArray(values, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    insert(index) {
        if (arguments.length <= 1)
            return this;
        var values = new Array(arguments.length - 1);
        for (var i = 1; i < arguments.length; i++) {
            values[i - 1] = arguments[i];
        }
        var state = List.insertArray(index, values, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    insertArray(index, values) {
        if (values.length === 0)
            return this;
        var state = List.insertArray(index, values, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    delete(index) {
        var state = List.remove(index, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    deleteRange(start, end) {
        var state = List.removeRange(start, end, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    pop() {
        var state = List.pop(this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    popFront() {
        var state = List.popFront(this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    skip(count) {
        var state = List.skip(count, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    take(count) {
        var state = List.take(count, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    slice(start, end = 0) {
        var state = List.slice(start, end, this._state);
        return state === this._state ? this : new PersistentList(state);
    }
    concat(list) {
        if (arguments.length === 0)
            return this;
        var state = arguments.length === 1
            ? List.concat(this._state, list._state)
            : List.concatMany([this._state].concat(Array.from(arguments).map(arg => arg._state)));
        return state === this._state ? this : new PersistentList(state);
    }
    toArray() {
        return values_1.createArray(this._state);
    }
    [Symbol.iterator]() {
        return values_1.createIterator(this._state);
    }
    values() {
        return values_1.createIterator(this._state);
    }
    toJS() {
        return this.toArray();
    }
}
exports.PersistentList = PersistentList;
function isDefaultEmptyList(list) {
    return list === exports._emptyList;
}
exports.isDefaultEmptyList = isDefaultEmptyList;
exports._emptyList = new PersistentList(state_1.emptyState(false));

//# sourceMappingURL=list.js.map
