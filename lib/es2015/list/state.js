"use strict";
const ownership_1 = require("../shared/ownership");
const traversal_1 = require("./traversal");
const view_1 = require("./view");
class ListState {
    constructor(group, owner, size, lastWrite, left, right) {
        this.group = group;
        this.owner = owner;
        this.size = size;
        this.lastWrite = lastWrite;
        this.left = left;
        this.right = right;
    }
}
exports.ListState = ListState;
function cloneState(state, group, mutable) {
    return new ListState(group, mutable ? ownership_1.batch.owner || -1 : 0, state.size, state.lastWrite, state.left, state.right);
}
exports.cloneState = cloneState;
function ensureMutable(state) {
    return ownership_1.isMutable(state.owner) ? state : cloneState(state, ownership_1.nextId(), true);
}
exports.ensureMutable = ensureMutable;
function ensureImmutable(state, done) {
    if (!ownership_1.isMutable(state.owner)) {
        return state;
    }
    if (done) {
        state.owner = 0;
        state.group = ownership_1.nextId();
        return state;
    }
    var state = cloneState(state, state.group, false);
    state.group = ownership_1.nextId();
    return state;
}
exports.ensureImmutable = ensureImmutable;
function getView(state, anchor, asWriteTarget, preferredOrdinal = -1) {
    var view = anchor === 0 ? state.left : state.right;
    if (view.isNone()) {
        var otherView = anchor === 1 ? state.left : state.right;
        if (!otherView.isNone()) {
            if (otherView.parent.isNone() || otherView.slot.size + otherView.offset === state.size) {
                setView(state, view_1.View.empty(otherView.anchor));
                otherView = otherView.cloneToGroup(state.group);
                otherView.flipAnchor(state.size);
                setView(state, view = otherView);
            }
            else {
                view = traversal_1.TreeWorker.refocusView(state, otherView, preferredOrdinal !== -1 ? preferredOrdinal : anchor === 0 ? 0 : -1, true, true);
            }
        }
    }
    if (asWriteTarget && !view.isEditable(state.group)) {
        setView(state, view = view.cloneToGroup(state.group));
    }
    return view;
}
exports.getView = getView;
function getOtherView(state, anchor) {
    return anchor === 0 ? state.right : state.left;
}
exports.getOtherView = getOtherView;
function setView(state, view) {
    if (view.anchor === 0) {
        state.left = view;
    }
    else {
        state.right = view;
    }
}
exports.setView = setView;
function emptyState(mutable) {
    return mutable
        ? new ListState(ownership_1.nextId(), ownership_1.batch.owner || -1, 0, 1, view_1.View.empty(0), view_1.View.empty(1))
        : _defaultEmpty;
}
exports.emptyState = emptyState;
var _defaultEmpty = new ListState(0, 0, 0, 1, view_1.View.empty(0), view_1.View.empty(1));

//# sourceMappingURL=state.js.map
