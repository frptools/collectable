"use strict";
const ownership_1 = require("../shared/ownership");
const deep_1 = require("../shared/deep");
const functions_1 = require("../shared/functions");
const common_1 = require("../shared/common");
const state_1 = require("./state");
function createMap() {
    return new PersistentMap(state_1.createState());
}
class PersistentMap {
    constructor(state) {
        this._serializing = void 0;
        this._state = state;
    }
    static create(create) {
        if (functions_1.isUndefined(create)) {
            return createMap();
        }
        return ownership_1.batch(owner => {
            var map = createMap();
            return create(map) || map;
        });
    }
    static empty() {
        return ownership_1.batch.active ? PersistentMap.create() : PersistentMap._empty;
    }
    prep() {
        return ownership_1.isMutable(this._state.owner) ? this : this.clone();
    }
    get size() {
        return this._state.values.size;
    }
    get mutable() {
        return ownership_1.isMutable(this._state.owner);
    }
    batch(callback) {
        ownership_1.batch.start();
        var map = this.asMutable();
        map = callback(map) || map;
        if (ownership_1.batch.end()) {
            map._state.owner = 0;
        }
        return map;
    }
    asMutable() {
        return ownership_1.isMutable(this._state.owner) ? this : new PersistentMap(state_1.cloneState(this._state, true));
    }
    asImmutable() {
        return ownership_1.isMutable(this._state.owner) ? new PersistentMap(state_1.cloneState(this._state, false)) : this;
    }
    update(key, callback) {
        var oldv = this.get(key);
        var newv = callback(oldv);
        return newv === oldv ? this : this.set(key, newv);
    }
    clone() {
        return new PersistentMap(state_1.cloneState(this._state));
    }
    get(key) {
        return this._state.values.get(key);
    }
    getIn(path) {
        return deep_1.getDeep(this._state, path);
    }
    set(key, value) {
        var map = this.prep();
        map._state.values.set(key, value);
        return map;
    }
    setIn(path, value) {
        return new PersistentMap(deep_1.setDeep(this._state, path, 0, value));
    }
    has(key) {
        return this._state.values.has(key);
    }
    hasIn(path) {
        return deep_1.hasDeep(this._state, path);
    }
    delete(key) {
        var map = this.prep();
        map._state.values.delete(key);
        return map;
    }
    keys() {
        return this._state.values.keys();
    }
    values() {
        return this._state.values.values();
    }
    entries() {
        return this._state.values.entries();
    }
    [Symbol.iterator]() {
        return this._state.values[Symbol.iterator]();
    }
    toJS() {
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
    }
}
PersistentMap._empty = PersistentMap.create();
exports.PersistentMap = PersistentMap;

//# sourceMappingURL=map.js.map
