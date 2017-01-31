"use strict";
function isDefined(value) {
    return value !== void 0;
}
exports.isDefined = isDefined;
function isUndefined(value) {
    return value === void 0;
}
exports.isUndefined = isUndefined;
function isFunction(value) {
    return typeof value === 'function';
}
exports.isFunction = isFunction;
function abs(value) {
    return value < 0 ? -value : value;
}
exports.abs = abs;
function min(a, b) {
    return a <= b ? a : b;
}
exports.min = min;
function max(a, b) {
    return a >= b ? a : b;
}
exports.max = max;

//# sourceMappingURL=functions.js.map
