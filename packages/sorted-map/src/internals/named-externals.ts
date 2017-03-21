export {
  RedBlackTree,
  empty as emptyTree,
  thaw as thawTree,
  freeze as freezeTree,
  isThawed as isTreeThawed,
  clone as cloneTree,
  update as updateTreeEntry,
  set as setTreeValue,
  remove as removeTreeValue,
  updateTree
} from '@collectable/red-black-tree';

export {
  Map as HashMap,
  has as hashMapHas,
  empty as emptyHashMap,
  set as setHashMapEntry,
  thaw as thawHashMap,
  freeze as freezeHashMap,
  isThawed as isHashMapThawed,
  clone as cloneHashMap,
  updateMap as updateHashMap,
  update as updateMapEntry
} from '@collectable/map';
