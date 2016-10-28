var __publishCallback: Function;
function publish(...args: any[]): void
function publish(): void {
  if(arguments[0] && arguments[0].length === 1 && arguments[0][0] && arguments[0][0].length === 1073741824) {
    debugger;
  }
  if(__publishCallback) __publishCallback.apply(null, arguments);
}
export function setCallback(callback: Function): void {
  __publishCallback = callback;
}

/*
  # Custom RRB Tree/Persistent Vector Trie Implementation

  This implementation uses an inverted tree to coordinate efficient reads and writes to the vector trie. The entrypoints
  to the tree ("views") are leaf nodes in the trie, and include associated start/end values with respect to the leaf's
  position in the overall list. Each view points to another view representing the child node's parent node in the trie.
  All views ultimately converge at the trie root. The last (and often only) view is the right/tail edge of the graph and
  can be relied upon for fast appends to the end of the graph. The first view in the list is the left edge of the graph
  if its `start` property is 0. Writes can be made to views and lazily written to their parent nodes. The set of views
  can be conditionally mutated even in read-only contexts, as long as doing so does not change the tree as perceived by
  an external consumer. As such, a central indexing view can be used to quickly traverse neighbouring leaf nodes while
  iterating through the tree, and the only potentially negative effect of this mutable characteristic might be competing
  references to the list causing the central view to be reassigned frequently. The only downside to this would be losing
  the optimised leaf node access and thus accessing the tree at O(logN) speed.
*/

// BITCOUNT = number of bits required to store the value
// OFFSET = number of bits to shift left/right to move the value into or out of the zero position
// MASK = zeros out bits that are not part of the desired value (assumes zero position unless it's a 1-bit flag)
// RESET = inverted mask - zeros out the bits of the value and preserves the rest (zero position as above)

const enum CONST {

  // Branch factor means the number of slots (branches) that each node can contain (2^5=32). Each level of the tree
  // represents a different order of magnitude (base 32) of a given index in the list. The branch factor bit count and
  // mask are used to isolate each different order of magnitude (groups of 5 bits in the binary representation of a
  // given list index) in order to descend the tree to the leaf node containing the value at the specified index.
  BRANCH_INDEX_BITCOUNT = 3,
  BRANCH_FACTOR = 1 << BRANCH_INDEX_BITCOUNT,
  BRANCH_INDEX_MASK = BRANCH_FACTOR - 1,
  BRANCH_INDEX_RESET = ~BRANCH_INDEX_MASK,

  MAX_OFFSET_ERROR = (BRANCH_INDEX_BITCOUNT >>> 2) + 1, // `e` in the RRB paper

  // // We store the child slot count as metadata for each slot, even though the child slot array, whose length the value
  // // represents, is a sibling property of the slot metadata, because when uncommitted changes are pending for a child
  // // node, the slot array is emptied to avoid hanging onto obsolete data that is no longer referenced by the uncommitted
  // // child node that hasn't yet been written to the parent slot, but the old slot count is still needed when committing.
  // SLOT_COUNT_BITCOUNT = BRANCH_INDEX_BITCOUNT + 1, // 0 - 32 (inclusive)
  // SLOT_COUNT_MASK = (1 << SLOT_COUNT_BITCOUNT) - 1,
  // SLOT_COUNT_RESET = ~SLOT_COUNT_MASK,

  // // Accumulated count of the number of child slots that a given slot points at. The range value for the first slot of a
  // // given node is equal to the number of child slots for that slot. The second slot's range count works the same way
  // // but adds to the accumulated total ranges of all the slots to its left, within that node.
  // SLOT_RANGE_BITCOUNT = BRANCH_INDEX_BITCOUNT << 1,
  // SLOT_RANGE_OFFSET = SLOT_COUNT_BITCOUNT,
  // SLOT_RANGE_MASK = (1 << SLOT_RANGE_BITCOUNT) - 1,
  // SLOT_RANGE_RESET = ~(SLOT_RANGE_MASK << SLOT_RANGE_OFFSET),

  // // Invalidation is a count of the total number of slots (counted from the right) for which the associated RANGE values
  // // need to be recomputed before being used in any calculations. When appending a slot to a relaxed node, this value
  // // should be incremented.
  // SLOT_INVALIDSLOTS_BITCOUNT = BRANCH_INDEX_BITCOUNT,
  // SLOT_INVALIDSLOTS_OFFSET = SLOT_RANGE_OFFSET + SLOT_RANGE_BITCOUNT,
  // SLOT_INVALIDSLOTS_MASK = (1 << SLOT_INVALIDSLOTS_BITCOUNT) - 1,
  // SLOT_INVALIDSLOTS_RESET = ~(SLOT_INVALIDSLOTS_MASK << SLOT_INVALIDSLOTS_OFFSET),

  // // Bitwise flag indicating that the slot represents a relaxed node, as per the RRB tree data structure extensions.
  // SLOT_ISRELAXED_OFFSET = SLOT_INVALIDSLOTS_OFFSET + 1,
  // SLOT_ISRELAXED_MASK = 1 << SLOT_ISRELAXED_OFFSET,
  // SLOT_ISRELAXED_RESET = ~SLOT_ISRELAXED_MASK,

  // VIEW_LEVELSHIFT_BITCOUNT = 6,
  // VIEW_LEVELSHIFT_OFFSET = BRANCH_INDEX_BITCOUNT,
  // VIEW_LEVELSHIFT_MASK = (1 << VIEW_LEVELSHIFT_BITCOUNT) - 1,
  // VIEW_LEVELSHIFT_RESET = ~(VIEW_LEVELSHIFT_MASK << VIEW_LEVELSHIFT_OFFSET),

  // VIEW_ISROOT_OFFSET = VIEW_LEVELSHIFT_OFFSET + VIEW_LEVELSHIFT_BITCOUNT,
  // VIEW_ISROOT_MASK = 1 << VIEW_ISROOT_OFFSET,
  // VIEW_ISROOT_RESET = ~VIEW_ISROOT_MASK,

  // VIEW_ISWRITEMODE_OFFSET = VIEW_ISROOT_OFFSET + 1,
  // VIEW_ISWRITEMODE_MASK = 1 << VIEW_ISWRITEMODE_OFFSET,
  // VIEW_ISWRITEMODE_RESET = ~VIEW_ISWRITEMODE_MASK,
}

const enum ACTION {
  REFRESH_LEFT = 1,
  REFRESH_RIGHT = 2,
  COMMIT = 3,
  EXPAND_LEFT = 4,
  EXPAND_RIGHT = 5,
  APPEND_LEFT = 6,
  APPEND_RIGHT = 7,
  CONTRACT = 8,
  DELETE = 9
}

class Slot<T> {
  public id: number;
  constructor(
    public group: number,
    public size: number, // the total number of descendent elements
    public sum: number, // the total accumulated size at this slot
    public recompute: number, // the number of child slots for which the sum must be recalculated
    public subcount: number, // the total number of slots belonging to immediate child slots
    public slots: (Slot<T>|T)[]
  ) {
    this.id = ++nextId;
  }
}

class View<T> {
  public id: number;
  constructor(
    public group: number,
    public start: number,
    public end: number,
    public slotIndex: number,
    public sizeDelta: number,
    public changed: boolean,
    public parent: View<T>,
    public slot: Slot<T>,
  ) {
    this.id = ++nextId;
  }
}

type ListMutationCallback<T> = (list: MutableList<T>) => void;
var nextId = 0;

export class List<T> {
  public _id: number;
  constructor(
    public size: number,
    public _views: View<T>[] // middle view points directly to root if no indexing has yet been performed
  ) {
    this._id = ++nextId;
  }

  static empty<T>(): List<T> {
publish(emptyList, true, 'EMPTY LIST');
    return emptyList;
  }

  static of<T>(values: T[]): List<T> {
    if(!Array.isArray(values)) {
      throw new Error('First argument must be an array of values');
    }
    var list = MutableList.empty<T>();
    list.size = values.length;
    var nodes = list._increaseCapacity(list._views[0], values.length);
    for(var i = 0, nodeIndex = 0, slotIndex = 0, node = nodes[0];
        i < values.length;
        i++, slotIndex >= CONST.BRANCH_INDEX_MASK ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
      node[slotIndex] = values[i];
    }
publish(list, true, `DONE: created list of ${values.length} values`);
    return list.immutable();
  }

  mutable(callback: ListMutationCallback<T>): List<T> {
    var list = mutableList<T>(this, false);
    callback(list);
    return list.immutable();
  }

  append(...values: T[]): List<T>
  append(): List<T> {
    var tail: View<T>, slot: Slot<T>;
    if(arguments.length === 0) {
      return this;
    }
    else if(arguments.length === 1 && this.size > 0) {
      tail = last(this._views);
      if(tail.changed && (slot = tail.slot).size < CONST.BRANCH_FACTOR) {
        var group = ++nextId;
        slot = new Slot<T>(group, slot.size + 1, 0, 0, 0, copyToFixedArray(slot.slots, slot.size + 1));
        slot.slots[slot.size - 1] = arguments[0];
        var views = copyArray(this._views);
        views[views.length - 1] = new View<T>(group, tail.start, tail.end + 1, tail.slotIndex, tail.sizeDelta + 1, tail.changed, tail.parent, slot);
        return new List<T>(this.size + 1, views);
      }
    }

    var list = mutableList<T>(this, false);
    list.append.apply(list, arguments);
publish(list, true, `DONE: appended ${arguments.length} value(s): ${Array.from(arguments).map(val => typeof val === 'string' ? `"${val}"` : val).join(', ')}`);
    return list.immutable();
  }

  pop(): T|undefined {
    return void 0;
  }

  slice(start: number, end?: number): List<T> {
    var list = mutableList<T>(this, false);
    list.slice(start, end);
    return list.immutable();
  }

  concat(...lists: List<T>[]): List<T>
  concat(): List<T> {
    if(arguments.length === 0) {
      return this;
    }
    var list = mutableList<T>(this, false);
    list.concat.apply(list, arguments);
    return list.immutable();
  }
}

/*
  TODO:
  // 1. the view count should be variable in length, often only having a single element while being built
  2. when prepending or dissecting, the left view is known to be an edge view if origin < 0 || view.start === 0
  3. the zeroing-out optimisation won't work without committing all the way back to root. remove any code that assumes
     that zeroing out is going to be needed. e.g. storing the slot count rather than just reading the array length.
     NOTE: the tradeoff is ok; what it means is we're trading a bit of extra memory for temporary write performance.
  4. force commit after explicit list.mutable(...)
  5. when writes are expected, zero out the old leaf BEFORE establishing the view

  IDEAS:
  - "write" mode - views established as per point 5, above
  - "read" mode - for when reading, without the overhead of the above
  - tail is always in write mode, as is head, if it exists
*/

class MutableList<T> {
  _group = ++nextId;

  // original immutable list reference
  _list: List<T> = emptyList;

  // primary mutation targets
  size = 0;
  _views: View<T>[] = [];

  // transient mutation state properties
  _changed = false;
  // _extraCapacity = 0;
  _leftViewIndex = -1;
  _rightViewIndex = -1;
  _leftItemEnd = -1;
  _rightItemStart = -1;

  static empty<T>(): MutableList<T> {
    var list = new MutableList<T>();
    list._changed = true;
    list._views = [emptyView];
    return list;
  }

  _reset(list: List<T>): MutableList<T> {
    this._group = ++nextId;
    this._list = list;
    this.size = list.size;
    this._changed = false;
    this._views = copyArray(list._views);

    return this;
  }

  _resetMutationState() {
    this._leftViewIndex = -1;
    this._rightViewIndex = -1;
    this._leftItemEnd = -1;
    this._rightItemStart = -1;
  }

  immutable(): List<T> {
    if(!this._changed) {
      return this._list;
    }

    // if(this._isBatchMode) {
    //   this._changed = false;
    //   this._id = ++nextId;
    //   var views = copyArray(this._views);
    //   var tail = views[views.length - 1];
    //   tail.slot.slots.length = tail.end - tail.start;
    //   return this._list = new List<T>(++nextId, this.size, 0, views);
    // }

    // non-batched, so release resources
    var list = new List<T>(this.size, this._views);
    this._list = emptyList;
    this._views = [];
    return list;
  }

  // todo: "fast" append short path when there is only one value and the tail isn't full

  // appendOne(value: T): MutableList<T> {
  //   this.size++;
  //   this._changed = true;
  // }

  append(...values: T[]): MutableList<T>
  append(): MutableList<T> {
    var values = arguments;
    if(values.length === 0) {
      return this;
    }

    this.size += values.length;
    this._changed = true;

    var tail = last(this._views);
log('INCREASE CAPACITY BY ' + values.length);
    var nodes = this._increaseCapacity(last(this._views), values.length);

    for(var i = 0, nodeIndex = 0, node = nodes[nodeIndex], slotIndex = (tail.end - tail.start) % CONST.BRANCH_FACTOR;
        i < values.length;
        i++, slotIndex >= node.length - 1 ? (slotIndex = 0, node = nodes[++nodeIndex]) : (++slotIndex)) {
log(`${'###'} set value "${values[i]}" in node ${nodeIndex}, slot ${slotIndex}`);
      node[slotIndex] = values[i];
    }
    return this;
  }

  pop(): T|undefined {
    return void 0;
  }

  slice(start: number, end?: number): MutableList<T> {

    return this;
  }

  concat(...lists: (List<T>|MutableList<T>)[]): MutableList<T>
  concat(): MutableList<T> {
    for(var i = 0; i < arguments.length; i++) {
      var list: (List<T>|MutableList<T>) = arguments[i];
      if(this === list) {
        this._group = ++nextId; // prevent ghosted mutations to nodes that are referenced both left and right
      }
    }

    return this;
  }

  _head<T>(list: List<T>|MutableList<T>): View<T> {
    var view = list._views[0];
    if(view.start === 0) return view;
    for(var view = last(list._views), level = 0; view.start > 0; view = view.parent, level++);
    while(level > 0) {
      var slot = <Slot<T>>view.slot.slots[0];
      view = new View<T>(this._group, 0, slot.size, 0, 0, false, view, slot);
      level--;
    }
    return view;
  }

  _join(inputs: [Slot<T>, Slot<T>]): boolean {
    var left = inputs[0], right = inputs[1];
    var count = left.slots.length + right.slots.length;
    var reducedCount = calculateRebalancedSlotCount(count, left.subcount + right.subcount);
    if(count === reducedCount) {
      return false;
    }

  }

  _split(slot: Slot<T>, slotIndex: number): [Slot<T>, Slot<T>] {

  }

  _increaseCapacity(oldTail: View<T>, increaseBy: number): T[][] {
    var view = oldTail,
        childView: View<T> = <any>void 0,
        slot = view.slot,
        slots: (T|Slot<T>)[] = slot.slots,
        remainingCapacityToAdd = increaseBy,
        capacityAdded = 0,
        totalRequiredAdditionalSlots = increaseBy,
        level = 0,
        shift = 0,
        group = this._group,
        nodes: T[][] = <any>void 0,
        nodeIndex = 0;

    // TODO: remove batch mode. It's not needed. If the user wants to batch add elements, use concat, or append(x, x, ...).

    var views: View<T>[] = [];

    // -----------------------------------------------------------------------------------------------------------------
    // Ascend the tree, preparing the views and expanding the existing edge nodes as needed. Each iteration of the loop
    // deals with one level of the tree, starting at the base level (leaf nodes).

    do {
      var slotCount = slot.slots.length;
      var nextSlotIndex = slotCount;
log(`[increaseCapacity] ITERATE LOOP (remainingCapacityToAdd: ${remainingCapacityToAdd}, totalRequiredAdditionalSlots: ${totalRequiredAdditionalSlots}, level: ${level}, shift: ${shift}, nodeIndex: ${nodeIndex}, nextSlotIndex: ${nextSlotIndex})`);
      var willOverflowRight = slotCount + totalRequiredAdditionalSlots > CONST.BRANCH_FACTOR;
      var expandCurrentNode = CONST.BRANCH_FACTOR - slotCount > 0;
      var isLeafLevel = level === 0, isParentLevel = !isLeafLevel;
      var numberOfAddedSlots: number, delta: number;
log(`will overflow right?`, willOverflowRight);

      if(view.group !== group) {
var temp = `replace view ${view.id} (having slot index ${view.slotIndex}) with new view `;
        view = new View<T>(group, view.start, view.end, view.slotIndex, view.sizeDelta, view.changed, view.parent, slot);
log(temp + view.id);
        if(isLeafLevel) {
          this._views[this._views.length - 1] = view;
        }
        else {
          childView.parent = view;
        }
      }
      views.push(view);

      if(expandCurrentNode) {
        numberOfAddedSlots = willOverflowRight ? CONST.BRANCH_FACTOR - slotCount : totalRequiredAdditionalSlots;
        slotCount += numberOfAddedSlots;
        delta = min(numberOfAddedSlots << shift, remainingCapacityToAdd);
        capacityAdded += delta;
        remainingCapacityToAdd -= delta;
      }
      else {
        numberOfAddedSlots = 0;
        delta = 0;
      }

      if(isParentLevel || expandCurrentNode) {
        if(slot.group !== group) {
log(`clone slot object (old id: ${slot.id}, group ${slot.group} => ${group}, slot array changed in size from ${slot.slots.length} to ${slotCount})`);
          slots = copyToFixedArray(slots, slotCount);
          slot = new Slot<T>(group, slot.size, 0, 0, slot.subcount, slots);
          view.slot = slot;
        }
        else if(expandCurrentNode) {
          slots.length = slotCount;
log(`slotCount is now: ${slotCount}`);
        }
      }

      if(isParentLevel) {
        var subcount = slot.subcount - (<Slot<T>>slots[childView.slotIndex]).slots.length;
        slots[childView.slotIndex] = childView.slot;
log(`child of slot ${slot.id} at index ${childView.slotIndex} has ${(<Slot<T>>slots[childView.slotIndex]).slots.length} subchild slots, compared to slot ${childView.slot.id} in the child view, which has ${childView.slot.slots.length} subchild slots.`);
        slot.subcount = subcount + childView.slot.slots.length;
        if(view.parent !== voidView) {
          view.sizeDelta += childView.sizeDelta;
        }
log(`slot size (${slot.size}) increased by child size delta (${childView.sizeDelta}) to ${slot.size + childView.sizeDelta}`);
        slot.size += childView.sizeDelta;
        view.end += childView.sizeDelta;
        childView.sizeDelta = 0;

        nodeIndex = this._populateSubtrees(views, nodes, nodeIndex, level, nextSlotIndex, remainingCapacityToAdd + delta);
      }
      else {
// log(`size delta was ${view.sizeDelta}. It will be increased by ${numberOfAddedSlots}`);
//         view.sizeDelta += numberOfAddedSlots;
        nodes = new Array<T[]>(shiftDownRoundUp(remainingCapacityToAdd, CONST.BRANCH_INDEX_BITCOUNT));
        if(expandCurrentNode) {
          nodes[0] = <T[]>slots;
          nodeIndex = 1;
        }
      }

      if(capacityAdded > 0) {
log(`level: ${level}, slot.size: ${slot.size}, capacityAdded: ${capacityAdded}`);
        if(isLeafLevel) {
          slot.size += capacityAdded;
          view.end += capacityAdded;
          view.sizeDelta += capacityAdded;
        }
        else if(isRelaxed(slot)) {
          slot.recompute = max(slot.recompute, slots.length - childView.slotIndex);
        }
      }

      if(willOverflowRight) {
        childView = view;
        level++;
        shift += CONST.BRANCH_INDEX_BITCOUNT;
        totalRequiredAdditionalSlots = shiftDownRoundUp(totalRequiredAdditionalSlots - numberOfAddedSlots, CONST.BRANCH_INDEX_BITCOUNT);

        if(view.parent === voidView) { // then the tree is full; grow it by adding an additional level above the current root
log('GROW');
          slot = new Slot<T>(group, slot.size - view.sizeDelta, 0, 0, slots.length, [slot]);
          view = new View<T>(group, view.start, view.end - view.sizeDelta, 0, 0, view.changed, voidView, slot);
        }
        else {
          view = view.parent;
          slot = view.slot;
        }
        slots = slot.slots;
        childView.parent = view;
      }

publish(this, false, `level ${level - (willOverflowRight ? 1 : 0)} capacity applied`);

    } while(willOverflowRight);

    if(view.parent === voidView) {
  log(`this is the root, so the current view delta will be reset to 0`);
      view.sizeDelta = 0;
    }

    return <T[][]>nodes;
  }

  _populateSubtrees<T>(views: View<T>[], nodes: T[][], nodeIndex: number, level: number, firstSlotIndex: number, remaining: number): number {
publish(this, false, `populate subtree from level ${level}, slot index ${firstSlotIndex}, remaining to add: ${remaining}`);
    var levelIndex = level;
    var shift = CONST.BRANCH_INDEX_BITCOUNT * levelIndex;
    var view = last(views);
    var leafView = views[0];
    var group = view.group;
    var slots = view.slot.slots;
    var slotIndex = firstSlotIndex;
    var slotCount = view.slot.slots.length;
    var slotIndices = new Array<number>(views.length);
    var slotCounts = new Array<number>(views.length);
    var currentEnd = view.end;
    var delta = 0, subcount = 0;
    slotIndices[levelIndex] = slotIndex;
    slotCounts[levelIndex] = slotCount;

log(`BEGIN POPULATE SUBTREES (from level: ${level}, firstSlotIndex: ${firstSlotIndex})`);

    do {
log(`[populateSubtrees] ITERATE LOOP (remaining: ${remaining}, levelIndex: ${levelIndex}, slotIndex: ${slotIndex}, slotCount: ${slotCount}, current view id: ${view.id})`);
      // ---------------------------------------------------------------------------------------------------------------
      // IF THE CURRENT SUBTREE IS FULLY POPULATED, ASCEND TO THE NEXT TREE LEVEL TO POPULATE THE NEXT ADJACENT SUBTREE

      if(slotIndex === slotCount) {
log(`ASCEND; end value for view ${view.id} changed to ${currentEnd}`);
log(`child size delta is ${view.sizeDelta}`, view);
        if(levelIndex === 1) {
          view.slot.size += delta;
          view.slot.subcount += subcount;
          if(levelIndex < level) {
            // delta += view.sizeDelta;
// log(`increasing \`delta\` to ${delta}`);
          }
          else {
            view.sizeDelta += delta;
          }
log(`levelIndex is 1, so view slot size is increased by its own delta to ${view.slot.size}`);
        }
        // else {
        //   delta = view.sizeDelta;
        // }
        levelIndex++;
        view.end = currentEnd;

        if(remaining === 0) {
          view.changed = true;
          var lastSlot = <Slot<T>>last(slots);
          slots[slots.length - 1] = new Slot<T>(0, lastSlot.size, lastSlot.sum, lastSlot.recompute, lastSlot.subcount, new Array<T>(lastSlot.slots.length)); // set the last slot as uncommitted
        }
        if(levelIndex <= level) {
log(`slot index from slotIndices[${levelIndex}] changed from ${slotIndices[levelIndex]} to ${slotIndices[levelIndex]+1}`);
          slotIndex = ++slotIndices[levelIndex];
          subcount = slotCount;
          slotCount = slotCounts[levelIndex];
log(`[A] slotIndex changed to: ${slotIndex}; slotCount at this level is ${slotCount}`);
          shift += CONST.BRANCH_INDEX_BITCOUNT;
log(`reset child view delta to 0; active delta is ${delta}`);
          view.sizeDelta = 0;
          view = views[levelIndex];
log(`view for levelIndex ${levelIndex} has id ${view.id}, and will have its slot size increased from ${view.slot.size} to ${view.slot.size + delta}`);
          view.slot.size += delta;
log(`increasing \`delta\` to ${delta}`);
          delta += view.sizeDelta;
          view.sizeDelta = delta;
log(`slot size is now: ${view.slot.size}; increase subcount of slot ${view.slot.id} by ${subcount}`);
          view.slot.subcount += subcount;
          slots = view.slot.slots;
        }
      }

      // ---------------------------------------------------------------------------------------------------------------
      // CREATE NEW SLOTS FOR EACH UNPOPULATED SLOT INDEX IN THE CURRENT NODE, AND RECURSIVELY DESCEND AND POPULATE THEM

      else {
        // at leaf parent level; just populate the leaf nodes, then ascend
log(`levelIndex: ${levelIndex}, remaining: ${remaining}`);
        if(levelIndex === 1) {
          var elementCount: number, leafSlots: T[];

          if(remaining <= CONST.BRANCH_FACTOR) {
            elementCount = remaining;
            leafSlots = new Array<T>(remaining);
            remaining = 0;
          }
          else {
            elementCount = CONST.BRANCH_FACTOR;
            leafSlots = new Array<T>(CONST.BRANCH_FACTOR);
            remaining -= CONST.BRANCH_FACTOR;
          }
log(`leafSlots assigned array of length ${leafSlots.length}`);
log(`new element count will be ${elementCount}`);

          nodes[nodeIndex++] = leafSlots;
log(`slots.length: ${slots.length}; assigning leafSlots to slot index ${slotIndex}`);
          slots[slotIndex] = leafView.slot = new Slot<T>(group, elementCount, 0, 0, 0, leafSlots);
          leafView.slotIndex = slotIndex;
          leafView.start = leafView.end;
          leafView.end += elementCount;
          delta += elementCount;
          subcount += elementCount;
          slotIndex++;
log(`[B] slotIndex changed to: ${slotIndex}`);
          currentEnd = leafView.end;
log(`currentEnd changed to: ${currentEnd}`);
        }

        // descend and populate the subtree
        else {
          shift -= CONST.BRANCH_INDEX_BITCOUNT;
          view = views[--levelIndex];
          delta = 0;
          subcount = 0;
log(`DESCEND; remaining: ${remaining}, shift: ${shift}, levelIndex: ${levelIndex}`);

          slotCount = remaining >>> shift;
          var remainder = 0;
          if(slotCount > CONST.BRANCH_FACTOR) {
            slotCount = CONST.BRANCH_FACTOR;
          }
          else if(slotCount < CONST.BRANCH_FACTOR) {
            remainder = modulo(remaining, shift);
          }
          view.start = view.end;
          view.end += (slotCount << shift) + remainder;
log(`view ${view.id} end changed to: ${view.end} (slot count: ${slotCount} + remainder: ${remainder})`);
          if(remainder > 0) slotCount++;
          view.slot = new Slot<T>(group, 0, 0, 0, 0, new Array<T>(slotCount));
          view.slotIndex = slotIndex;
log(`view ${view.id} slot index is now: ${view.slotIndex}`);
log(`assigned new slot (id: ${view.slot.id}) to view: new slotcount is: ${slotCount}`);
          slots[slotIndex] = view.slot;
          slots = view.slot.slots;
          slotCounts[levelIndex] = slotCount;
          slotIndices[levelIndex] = 0;
          slotIndex = 0;
          // addedCounts[levelIndex] = added = 0;
        }
      }
publish(this, false, `subtree updated at level ${levelIndex} (remaining: ${remaining})`);
    } while(levelIndex <= level);

    leafView.changed = true;
log('DONE POPULATING SUBTREES');
    return nodeIndex;
  }

  // _commit











  _resetRefreshState(index: number): void {
    var lvi: number, rvi: number;
    switch(index) {
      case 0: // head view
        lvi = -1;
        rvi = this._views.length > 1 ? 1 : -1;
        break;
      case -1: // tail view
        lvi = this._views.length - 2;
        rvi = -1;
        break;
      default:
        // todo: handle middle view
        lvi = -1;
        rvi = -1;
        break;
    }

    this._leftViewIndex = lvi;
    this._rightViewIndex = rvi;
    this._leftItemEnd = lvi === -1 ? -1 : this._views[lvi].end;
    this._rightItemStart = rvi === -1 ? -1 : this._views[rvi].start;
  }
/*
  I think the commit process below is incorrectly combining two concerns:
  1. updating view pointers when an ancestral view (the target) is being replaced
     - this happens when making changes to nodes
  2. writing slot changes back to their parent in preparation for leaving write mode

  scenario:
  - tail is full and going to be committed to make way for another append
  - a leaf node to its left has a size-mutating change that has not been written
    - such a change would cause only the parent range value to change
    - the child view with pending writes holds the slot at that index
    - if an insertion were performed that forced the addition of a new leaf node, we would climb the tree until we
      find a node that has space for the insertion. if an RRB node is found, great. that's the target. update the ranges
      then descend the tree and insert the new node. a rebalancing only takes place when a node leaves write mode, and
      it only traverses the number of levels required. if root is not reached, it's not important. rebalancing will occur
      at that level if and when required, such as during a concatenation.
  - maybe an append is just an insertion at the end?
  -
*/

  // public _shift = 0;

//   // The `target` argument is a mutable view that is an ancestor of a leaf view at the specified index. Obtaining a
//   // target is a contextual task based on the type of operation being performed on the list.
//   _commit(target: View<T>, viewIndex: number, direction: -1|0|1): void {
//     // var leftSiblingIndex = viewIndex - 1;
//     // var rightSiblingIndex = direction !== -1 && viewIndex < this._views.length - 1 ? viewIndex + 1 : -1;

//     // We only need to go up the tree as far as is necessary to ensure the the target is updated with any descendant
//     // changes. Similarly siblings only need to be checked if they also fall in range of the specified target. The
//     // commit operation should return the index of the closest view that has not yet been checked, or -1 there are no
//     // more in the direction specified by the `step` argument.

//     var child = this._views[viewIndex];
//     var meta = child.meta;
//     var isWriteMode = (meta & CONST.VIEW_ISWRITEMODE_MASK) === 1;

//     // get the child node metadata and check if the child node is currently in write mode
//     if(isWriteMode) {
//       // changes have occurred; prepare to make changes to the child view
//       child = mutableView(this._id, child);
//       // write the child back to the array of active views, as we'll want to forget the reference as we climb the tree
//       this._views[viewIndex] = child;
//       // get the shift value for child nodes of the target so that we know where to stop as we propagate changes back up the tree
//       var maxShift = getMetaValue(target.meta, CONST.VIEW_LEVELSHIFT_OFFSET, CONST.VIEW_LEVELSHIFT_MASK) - CONST.BRANCH_INDEX_BITCOUNT;

//       for(var shift = 0; shift <= maxShift; shift += CONST.BRANCH_INDEX_BITCOUNT) {
//         // get the number of slots in the child node; if it has changed, parent slot metadata may need to be updated/invalidated
//         var count = child.slot.slots.length;

//         // if shift === maxShift, then the child's parent is our `target` argument and this iteration is the last one
//         var parent = (shift === maxShift) ? target : mutableView(this._id, child.parent);
//         child.parent = parent;

//         // TODO: this is commented out because i changed "is changed" to "write mode", and just because I'm committing,
//         //       it doesn't mean i want to exit write mode.
//         // child.meta = meta & CONST.VIEW_ISWRITEMODE_RESET;

//         // the parent slot needs to be writable
//         var parentSlot = parent.slot;
//         if(parentSlot.group !== this._id) {
//           parent.slot = parentSlot = new Slot<T>(this._id, parentSlot.meta, copyArray(parentSlot.slots));
//         }

//         // we now have a mutable parent. commit any in-range siblings to the left BEFORE continuing.
//         if(direction !== 1) {
//           this._commitLeft(parent);
//         }
//         // if(leftSiblingIndex !== -1 && this._views[leftSiblingIndex].end >= parent.start) {
//         //   leftSiblingIndex = this._commit(parent, leftSiblingIndex, -1);
//         // }

//         var slots = <Slot<T>[]>parentSlot.slots;
//         var slotIndex = (meta & CONST.BRANCH_INDEX_MASK);
//         var slotCountChanged = (slots[slotIndex].meta & CONST.SLOT_COUNT_MASK) !== count;
//         slots[slotIndex] = child.slot;
//         var wasBasicNode = (meta = parentSlot.meta) !== 0;
//         var isSmallSlot = count < CONST.BRANCH_FACTOR && (slotIndex + 1) < count;

//         if((wasBasicNode && isSmallSlot) || (slotCountChanged && !wasBasicNode)) {
//           parentSlot.meta = ((meta | CONST.SLOT_ISRELAXED_MASK) & CONST.SLOT_INVALIDSLOTS_MASK)
//                     | (slotIndex << CONST.SLOT_INVALIDSLOTS_OFFSET);
//         }

//         if(direction !== -1) {
//           this._commitRight(parent);
//         }
//         // if(rightSiblingIndex !== -1 && this._views[rightSiblingIndex].start < parent.end) {
//         //   rightSiblingIndex = this._commit(parent, rightSiblingIndex, 1);
//         // }

//         child = parent;
//       }
//     }
//     else {
//       if(direction !== 1) {
//         this._commitLeft(target);
//       }
//       if(direction !== -1) {
//         this._commitRight(target);
//       }
//       // if(leftSiblingIndex !== -1 && this._views[leftSiblingIndex].end >= target.start) {
//       //   leftSiblingIndex = this._commit(target, leftSiblingIndex, -1);
//       // }
//       // if(rightSiblingIndex !== -1 && this._views[rightSiblingIndex].start < target.end) {
//       //   rightSiblingIndex = this._commit(target, rightSiblingIndex, 1);
//       // }
//     }
//     // return direction === -1 ? leftSiblingIndex :
//     //        direction === 1 ? rightSiblingIndex : 0;
//   }

//   _commitLeft(target: View<T>): void {
//     if(this._leftViewIndex !== -1 && this._views[this._leftViewIndex].end >= target.start) {
//       this._commit(target, this._leftViewIndex, -1);
//       this._leftViewIndex--;
//     }
//   }

//   _commitRight(target: View<T>): void {
//     if(this._rightViewIndex !== -1 && this._views[this._rightViewIndex].start < target.end) {
//       this._commit(target, this._rightViewIndex, 1);
//     }
//   }
}

class Mutator<T> {
  leftViewIndex = -1;
  rightViewIndex = -1;
  leftItemEnd = -1;
  rightItemStart = -1;
  // slotCount = 0; // how many slots do we want the next leaf node to have?

  activeView: View<T> = emptyView; // this will change as we ascend the tree
  // nextView: View<T> = emptyView; // this should be set when a new view is expected to be added to the tree
  nextSlotCount: number;
  preallocateAllSlots: boolean;

  constructor(
    public views: View<T>[],
    public batchMode: boolean
  ) {}

  clear() {
    this.views = [];
    this.activeView = emptyView;
  }

  setActiveView(index: number, view: View<T>): void {
    var lvi: number, rvi: number;
    this.activeView = view;
    switch(index) {
      case 0: // head
        lvi = -1;
        rvi = this.views.length > 1 ? 1 : -1;
        break;
      case -1: // tail
        lvi = this.views.length - 2;
        rvi = -1;
        break;
      default:
        // todo: find the view at the specified index (separate function)
        lvi = -1;
        rvi = -1;
        break;
    }

    this.leftViewIndex = lvi;
    this.rightViewIndex = rvi;
    this.leftItemEnd = lvi === -1 ? -1 : this.views[lvi].end;
    this.rightItemStart = rvi === -1 ? -1 : this.views[rvi].start;
  }

  setNextViewParams(size: number, preallocateAllSlots: boolean): void {
    this.nextSlotCount = size;
    this.preallocateAllSlots = preallocateAllSlots;
  }
}

class CommitState {
  leftViewIndex = -1;
  rightViewIndex = -1;
  leftItemEnd = -1;
  rightItemStart = -1;
}

/*
  ACTIONS:
  1. [commit] writes because the focused view is being changed from one mid-range leaf node to another
  2. [refresh] pointers because a node view reference is changing
  3. [expand] empty node right|left, so that it can be written to
  4. [append] value to a node (either a value to a leaf node, or a node to a parent node)
  4. [contract] the tree by removing a node
  5. [delete] element from leaf node
*/

// function ascend<T>(group: number, state: Mutator<T>, action: ACTION): void {
//   // this is the decision making location, where actions are applied
//   var view = mutableView(group, state.activeView), meta = view.meta;
//   var parentView = view.parent;
//   var isWriteMode = meta & CONST.VIEW_ISWRITEMODE_MASK;
//   var slotIndex = 0;

//   for(var shift = 0, done = false; !done; shift += CONST.BRANCH_INDEX_BITCOUNT) {
//     done = true;
//     switch(action) {

//       case ACTION.APPEND_RIGHT:
//         // no parent means we're gonna have to grow the tree. old root becomes the first slot. new root has two slots.
//         // new slot will be a dummy slot because the tail is always in write mode.
//         if(parentView === voidView) {
//           parentView = createRoot<T>(group,
//             [view.slot, dummySlot<T>(group, isLeafParent(shift) ? 1 : state.nextSlotCount)],
//             shift + CONST.BRANCH_INDEX_BITCOUNT, view.start, view.end + state.nextSlotCount,
//             view.slot.slots.length < CONST.BRANCH_FACTOR);
//           slotIndex = 1;
//           // todo: we're replacing the parent view. other affected views will need to be refreshed.
//           done = true;
//         }
//         // parent view isn't full. new node slot can be added to the end.
//         else if((parentView.slot.meta & CONST.SLOT_COUNT_MASK) < CONST.BRANCH_FACTOR) {
//           // parentView =
//         }
//         // nope, parent is full. go up a level.
//         else {
//         }
//         if(done) {
//           // we reached the top. the current view will be updated. dependent views should be refreshed.
//           view = new View<T>(group, CONST.VIEW_ISWRITEMODE_MASK & (shift << CONST.VIEW_LEVELSHIFT_OFFSET),
//             view.end, view.end + state.nextSlotCount, parentView, new Slot<T>(group, state.nextSlotCount,
//               shift > CONST.BRANCH_INDEX_BITCOUNT ? [emptySlot] :
//                 new Array<any>(state.preallocateAllSlots ? CONST.BRANCH_FACTOR : state.nextSlotCount)));

//         }
//         break;


//       default:
//         done = true;
//         break;
//     }
//   }
// }

// function commit<T>(state: Mutator<T>, target: View<T>): void {
//   // this is like refresh, but slots are not written to
//   // ... also, this might actually be a primary action, and therefore should become part of ascend
//   // ... or ... it'll be used by both GET and SET, with the latter causing write mode to be set, and
//   //            the former causing a commit if the focused leaf node is going to shift
// }

// function refresh<T>(state: Mutator<T>, target: View<T>, targetShift: number): void {
//   for(var shift = 0; shift < targetShift; shift += CONST.BRANCH_INDEX_BITCOUNT) {
//     // Will need to commit left/right as we rise
//     // Add leftStart and rightEnd ("range" value) to the state class
//     // At start/end of loop (depending if moving left or right), check leftStart or rightEnd, depending on direction
//     // if value is in range of current parent:
//     // 1. get the view at that index
//     // 2. check if the view is in range of current parent
//     // 3. if it is:
//     //    1. change the index and range value to the next view over
//     //    2. call refresh again, passing in the current mutable parent
//   }
// }

function calculateExtraSearchSteps(parentSlots: number, childSlots: number): number {
  return parentSlots - (((childSlots - 1) >>> CONST.BRANCH_INDEX_BITCOUNT) + 1);
}

function calculateRebalancedSlotCount(parentSlots: number, childSlots: number): number {
  var reduction = calculateExtraSearchSteps(parentSlots, childSlots) - CONST.MAX_OFFSET_ERROR;
  return parentSlots - (reduction > 0 ? reduction : 0);
}

function mutableList<T>(list: List<T>, batched: boolean): MutableList<T> {
  return batched ? new MutableList<T>()._reset(list) : _mutableList._reset(list);
}

function shiftDownRoundUp(value: number, shift: number): number {
  var a = value >>> shift;
  return a + ((a << shift) < value ? 1 : 0);
}

function modulo(value: number, shift: number): number {
  return value - ((value >>> shift) << shift);
}

function copyToFixedArray<T>(values: T[], size: number): T[] {
  var arr = new Array(size);
  for(var i = 0; i < values.length; i++) {
    arr[i] = values[i];
  }
  return arr;
}

// function copyArrayInto<T>(values: T[], size: number, offset: number): T[] {
//   var arr = new Array(size);
//   for(var i = 0; i < values.length; i++) {
//     arr[i + offset] = values[i];
//   }
//   return arr;
// }

function copyArray<T>(values: T[]): T[] {
  if(values.length > 7) {
    var arr = new Array(values.length);
    for(var i = 0; i < values.length; i++) {
      arr[i] = values[i];
    }
    return arr;
  }
  switch(values.length) {
    case 0: return [];
    case 1:  return [values[0]];
    case 2:  return [values[0], values[1]];
    case 3:  return [values[0], values[1], values[2]];
    case 4:  return [values[0], values[1], values[2], values[3]];
    case 5:  return [values[0], values[1], values[2], values[3], values[4]];
    case 6:  return [values[0], values[1], values[2], values[3], values[4], values[5]];
    case 7:  return [values[0], values[1], values[2], values[3], values[4], values[5], values[6]];
    default: return values.slice(); // never reached, but seems to trigger optimization in V8 for some reason
  }
}

function min(a: number, b: number): number {
  return a <= b ? a : b;
}

function max(a: number, b: number): number {
  return a >= b ? a : b;
}

function last<T>(array: T[]): T {
  return array[array.length - 1];
}

function isRelaxed<T>(slot: Slot<T>): boolean {
  return slot.sum !== 0;
}

var emptySlot = new Slot<any>(++nextId, 0, 0, 0, 0, []);
var voidView = new View<any>(++nextId, 0, 0, 0, 0, false, <any>void 0, emptySlot);
var emptyView = new View<any>(++nextId, 0, 0, 0, 0, false, voidView, emptySlot);
var emptyList = new List<any>(0, [emptyView]);
var _mutableList = new MutableList<any>();

function log(...args: any[])
function log() {
  publish(Array.from(arguments));
  // console.log.apply(console, arguments);
}
