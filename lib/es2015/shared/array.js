"use strict";
function copyArray(values) {
    if (values.length > 7) {
        var arr = new Array(values.length);
        for (var i = 0; i < values.length; i++) {
            arr[i] = values[i];
        }
        return arr;
    }
    switch (values.length) {
        case 0: return [];
        case 1: return [values[0]];
        case 2: return [values[0], values[1]];
        case 3: return [values[0], values[1], values[2]];
        case 4: return [values[0], values[1], values[2], values[3]];
        case 5: return [values[0], values[1], values[2], values[3], values[4]];
        case 6: return [values[0], values[1], values[2], values[3], values[4], values[5]];
        case 7: return [values[0], values[1], values[2], values[3], values[4], values[5], values[6]];
        default: return values.slice();
    }
}
exports.copyArray = copyArray;
function concatToNewArray(left, right, spaceBetween) {
    var arr = new Array(left.length + right.length + spaceBetween);
    for (var i = 0; i < left.length; i++) {
        arr[i] = left[i];
    }
    i += spaceBetween;
    for (var j = 0; j < right.length; i++, j++) {
        arr[i] = right[j];
    }
    return arr;
}
exports.concatToNewArray = concatToNewArray;
function blockCopy(sourceValues, targetValues, sourceIndex, targetIndex, count) {
    if (sourceValues === targetValues && sourceIndex < targetIndex) {
        for (var i = sourceIndex + count - 1, j = targetIndex + count - 1, c = 0; c < count; i--, j--, c++) {
            targetValues[j] = sourceValues[i];
        }
    }
    else {
        for (var i = sourceIndex, j = targetIndex, c = 0; c < count; i++, j++, c++) {
            targetValues[j] = sourceValues[i];
        }
    }
}
exports.blockCopy = blockCopy;
function truncateLeft(values, start) {
    var array = new Array(values.length - start);
    for (var i = 0, j = start; j < values.length; i++, j++) {
        array[i] = values[j];
    }
    return array;
}
exports.truncateLeft = truncateLeft;

//# sourceMappingURL=array.js.map
