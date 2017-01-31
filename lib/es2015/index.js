"use strict";
var ownership_1 = require("./shared/ownership");
exports.batch = ownership_1.batch;
var list_1 = require("./list");
exports.PersistentList = list_1.PersistentList;
var map_1 = require("./map/map");
exports.PersistentMap = map_1.PersistentMap;
var set_1 = require("./set/set");
exports.PersistentSet = set_1.PersistentSet;
const list_2 = require("./list");
const map_2 = require("./map");
const set_2 = require("./set");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    Map: map_2.PersistentMap, Set: set_2.PersistentSet, List: list_2.PersistentList
};

//# sourceMappingURL=index.js.map
