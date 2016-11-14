export const enum CONST {
  // Branch factor means the number of slots (branches) that each node can contain (2^5=32). Each level of the tree
  // represents a different order of magnitude (base 32) of a given index in the list. The branch factor bit count and
  // mask are used to isolate each different order of magnitude (groups of 5 bits in the binary representation of a
  // given list index) in order to descend the tree to the leaf node containing the value at the specified index.
  BRANCH_INDEX_BITCOUNT = 3,
  BRANCH_FACTOR = 1 << BRANCH_INDEX_BITCOUNT,
  BRANCH_INDEX_MASK = BRANCH_FACTOR - 1,

  MAX_OFFSET_ERROR = (BRANCH_INDEX_BITCOUNT >>> 2) + 1, // `e` in the RRB paper
}

export const enum DIRECTION {
  LEFT = -1,
  RIGHT = 1
}

export const enum COMMIT {
  NONE = 0,
  PARENT_ONLY = 1,
  BOTH = 2
}
