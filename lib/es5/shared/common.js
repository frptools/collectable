"use strict";
function isIterable(value) {
    return value && typeof value === 'object' && 'toJS' in value;
}
exports.isIterable = isIterable;

//# sourceMappingURL=common.js.map
