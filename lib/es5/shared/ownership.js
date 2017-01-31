"use strict";
var _nextId = 0;
function nextId() {
    return ++_nextId;
}
exports.nextId = nextId;
var _owner = 0, _depth = 0;
function start() {
    if (_depth === 0) {
        _owner = nextId();
    }
    else {
    }
    _depth++;
}
function end() {
    if (_depth > 0) {
        if (--_depth > 0) {
            return false;
        }
        _owner = 0;
    }
    return true;
}
exports.batch = Object.assign(function (callback) {
    start();
    var result = callback(_owner);
    end();
    return result;
}, {
    start: start,
    end: end
});
Object.defineProperties(exports.batch, {
    active: {
        get: function () {
            return _owner !== 0;
        }
    },
    owner: {
        get: function () {
            return _owner;
        }
    }
});
function isMutable(owner) {
    return owner === -1 || (owner !== 0 && owner === _owner);
}
exports.isMutable = isMutable;

//# sourceMappingURL=ownership.js.map
