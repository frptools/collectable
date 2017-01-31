"use strict";
const functions_1 = require("../shared/functions");
function invertOffset(offset, slotSize, listSize) {
    return listSize - offset - slotSize;
}
exports.invertOffset = invertOffset;
function invertAnchor(anchor) {
    return anchor === 1 ? 0 : 1;
}
exports.invertAnchor = invertAnchor;
function verifyIndex(size, index) {
    index = normalizeIndex(size, index);
    return index === size ? -1 : index;
}
exports.verifyIndex = verifyIndex;
function normalizeIndex(size, index) {
    return functions_1.max(-1, functions_1.min(size, index < 0 ? size + index : index));
}
exports.normalizeIndex = normalizeIndex;
function shiftDownRoundUp(value, shift) {
    var a = value >>> shift;
    return a + ((a << shift) < value ? 1 : 0);
}
exports.shiftDownRoundUp = shiftDownRoundUp;
function modulo(value, shift) {
    return value & ((32 << shift) - 1);
}
exports.modulo = modulo;
function concatSlotsToNewArray(left, right) {
    var arr = new Array(left.length + right.length);
    var sum = 0;
    for (var i = 0; i < left.length; i++) {
        arr[i] = left[i];
        arr[i].sum = (sum += left[i].size);
    }
    for (var j = 0; j < right.length; i++, j++) {
        arr[i] = right[j];
        arr[i].sum = (sum += right[j].size);
    }
    return arr;
}
exports.concatSlotsToNewArray = concatSlotsToNewArray;

//# sourceMappingURL=common.js.map
