"use strict";
var ownership_1 = require("../shared/ownership");
var MapState = (function () {
    function MapState(values, owner, group) {
        this.values = values;
        this.owner = owner;
        this.group = group;
    }
    return MapState;
}());
exports.MapState = MapState;
function cloneState(state, mutable) {
    if (mutable === void 0) { mutable = false; }
    return {
        values: new Map(state.values),
        owner: mutable ? ownership_1.batch.owner || -1 : 0,
        group: ownership_1.nextId()
    };
}
exports.cloneState = cloneState;
function createState() {
    return new MapState(new Map(), ownership_1.nextId(), ownership_1.batch.owner);
}
exports.createState = createState;
function emptyState() {
    return _empty;
}
exports.emptyState = emptyState;
var _empty = createState();

//# sourceMappingURL=state.js.map
