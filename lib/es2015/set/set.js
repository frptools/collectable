"use strict";
const ownership_1 = require("../shared/ownership");
const functions_1 = require("../shared/functions");
const common_1 = require("../shared/common");
function clone(state, mutable = false) {
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
class PersistentSet {
    constructor(state) {
        this._serializing = void 0;
        this._state = state;
    }
    static create(create) {
        if (functions_1.isUndefined(create)) {
            return createSet();
        }
        return ownership_1.batch(owner => {
            var set = createSet();
            return create(set) || set;
        });
    }
    static empty() {
        return ownership_1.batch.active ? PersistentSet.create() : PersistentSet._empty;
    }
    prep() {
        return ownership_1.isMutable(this._state.owner) ? this : this.clone();
    }
    get size() {
        return this._state.set.size;
    }
    get mutable() {
        return ownership_1.isMutable(this._state.owner);
    }
    batch(callback) {
        ownership_1.batch.start();
        var set = this.asMutable();
        set = callback(set) || set;
        if (ownership_1.batch.end()) {
            set._state.owner = 0;
        }
        return set;
    }
    asMutable() {
        return ownership_1.isMutable(this._state.owner) ? this : new PersistentSet(clone(this._state, true));
    }
    asImmutable() {
        return ownership_1.isMutable(this._state.owner) ? new PersistentSet(clone(this._state, false)) : this;
    }
    clone() {
        return new PersistentSet(clone(this._state));
    }
    add(value) {
        var set = this.prep();
        set._state.set.add(value);
        return set;
    }
    remove(value) {
        var set = this.prep();
        set._state.set.delete(value);
        return set;
    }
    has(value) {
        return this._state.set.has(value);
    }
    toArray() {
        var i = 0, array = new Array(this.size);
        for (var it = this.values(), current = it.next(); !current.done; current = it.next()) {
            array[i++] = current.value;
        }
        return array;
    }
    values() {
        return this._state.set.values();
    }
    [Symbol.iterator]() {
        return this._state.set[Symbol.iterator]();
    }
    toJS() {
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
    }
}
PersistentSet._empty = PersistentSet.create();
exports.PersistentSet = PersistentSet;

//# sourceMappingURL=set.js.map
