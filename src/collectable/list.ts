var __publishCallback: Function;
function publish(...args: any[]): void
function publish(): void {
  if(__publishCallback) __publishCallback.apply(null, arguments);
}
export function setCallback(callback: Function): void {
  __publishCallback = callback;
}

if(typeof window !== 'undefined') {
  window.addEventListener('error', ev => {
    log(ev.error);
  })
}
// process.on('uncaughtException', (err) => {
//   console.log('caught!');
//   publish(err);
// });


// TODO: see if performance is significantly affected by having two Slot<T> classes; one for vnodes and one for rnodes,
//       with only the latter having the additional fields, thus improving memory efficiency.

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

const enum CONST {
  // Branch factor means the number of slots (branches) that each node can contain (2^5=32). Each level of the tree
  // represents a different order of magnitude (base 32) of a given index in the list. The branch factor bit count and
  // mask are used to isolate each different order of magnitude (groups of 5 bits in the binary representation of a
  // given list index) in order to descend the tree to the leaf node containing the value at the specified index.
  BRANCH_INDEX_BITCOUNT = 2,
  BRANCH_FACTOR = 1 << BRANCH_INDEX_BITCOUNT,
  BRANCH_INDEX_MASK = BRANCH_FACTOR - 1,

  MAX_OFFSET_ERROR = (BRANCH_INDEX_BITCOUNT >>> 2) + 1, // `e` in the RRB paper
}

const enum COMMIT {
  LEFT = -1,
  RIGHT = 1
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

  clone(group: number): Slot<T> {
    return new Slot<T>(group, this.size, this.sum, this.recompute, this.subcount, copyArray(this.slots));
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

  clone(group: number): View<T> {
    return new View<T>(group, this.start, this.end, this.slotIndex, this.sizeDelta, this.changed, this.parent, this.slot);
  }

  ascend(restore: boolean): View<T> {
    var parentView: View<T>, parentSlot: Slot<T>;
    var isRoot = isRootView(this);
log(`is root: ${isRoot}`);
    if(isRoot) {
      this.parent = parentView = new View<T>(this.group, this.start, this.end, this.slot.sum, 0, false, voidView,
        parentSlot = new Slot<T>(this.group, this.slot.size, 0, 0, this.slot.slots.length, [this.slot]));
    }
    else {
      parentView = this.parent;
      parentSlot = parentView.slot;
    }

    if(this.changed) {
      if(parentView.group !== this.group) {
        this.parent = parentView = parentView.clone(this.group);
      }

      if(!isRoot) {
        parentView.sizeDelta += this.sizeDelta;
        parentView.end += this.sizeDelta;
      }

      if(parentSlot.group !== this.group) {
        parentView.slot = parentSlot = parentSlot.clone(this.group);
      }
      parentSlot.size += this.sizeDelta;
      parentSlot.subcount -= (<Slot<T>>parentSlot.slots[this.slotIndex]).slots.length - this.slot.slots.length;

      if(isRelaxed(parentSlot) || isRelaxed(this.slot)) {
        parentSlot.recompute = max(parentSlot.recompute, parentSlot.slots.length - this.slotIndex);
      }
      else {
        parentSlot.recompute = 0;
        parentSlot.sum = 0;
      }

      this.changed = false;
      this.sizeDelta = 0;

      if(restore && parentSlot.slots[this.slotIndex] !== this.slot) {
        parentSlot.slots[this.slotIndex] = this.slot;
      }
    }
    else if(restore && this.group !== parentView.group) {
      this.parent = parentView = parentView.clone(this.group);
    }

    return parentView;
  }

  replaceSlot(slot: Slot<T>): void {
    this.slot = slot;
    this.sizeDelta += slot.size - this.end + this.start;
    this.end = this.start + slot.size;
    this.changed = true;
  }

  slotCount(): number {
    return this.slot.slots.length;
  }
}

type ListMutationCallback<T> = (list: MutableList<T>) => void;
var nextId = 0;

export class List<T> {
  constructor(
    public size: number,
    public _views: View<T>[] // middle view points directly to root if no indexing has yet been performed
  ) {}

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
    var list = new MutableList<T>(++nextId, this);
    callback(list);
    return list.immutable();
  }

  append(...values: T[]): List<T>
  append(): List<T> {
    var tail: View<T>, slot: Slot<T>;
    if(arguments.length === 0) {
      return this;
    }
    else if(arguments.length === 1 && this.size > 0) { // fast append
      tail = last(this._views);
      if(tail.changed && (slot = tail.slot).size < CONST.BRANCH_FACTOR) {
        var group = ++nextId;
        slot = new Slot<T>(group, slot.size + 1, 0, 0, 0, padArrayRight(slot.slots, 1));
        slot.slots[slot.size - 1] = arguments[0];
        var views = copyArray(this._views);
        views[views.length - 1] = new View<T>(group, tail.start, tail.end + 1, tail.slotIndex,
                                              this.size > CONST.BRANCH_FACTOR ? tail.sizeDelta + 1 : 0,
                                              tail.changed, tail.parent, slot);
        return new List<T>(this.size + 1, views);
      }
    }

    var list = MutableList.transient<T>(this);
    list.append.apply(list, arguments);
publish(list, true, `DONE: appended ${arguments.length} value(s): ${Array.from(arguments).map(val => typeof val === 'string' ? `"${val}"` : val).join(', ')}`);
    return list.immutable();
  }

  pop(): T|undefined {
    return void 0;
  }

  slice(start: number, end?: number): List<T> {
    var list = MutableList.transient<T>(this);
    list.slice(start, end);
    return list.immutable();
  }

  concat(...lists: List<T>[]): List<T>
  concat(): List<T> {
    if(arguments.length === 0) {
      return this;
    }
    var list = MutableList.transient<T>(this);
    list.concat.apply(list, arguments);
publish(list, true, `DONE: concatenated ${arguments.length + 1} lists`);
    return list.immutable();
  }
}

class MutableList<T> {
  size: number;
  _views: View<T>[];

  _activeView: View<T> = <any>void 0;
  _leftViewIndex = -1;
  _rightViewIndex = -1;
  _leftItemEnd = -1;
  _rightItemStart = -1;

  static empty<T>(): MutableList<T> {
    var list = new MutableList<T>(++nextId, emptyList);
    list._views = [emptyView];
    return list;
  }

  static transient<T>(list: List<T>): MutableList<T> {
    return _mutableList._init(++nextId, list);
  }

  constructor(
    public _group: number,
    list: List<T>,
  ) {
    this.size = list.size;
    this._views = list === emptyList ? <any>void 0 : copyArray(list._views);
  }

  private _init(group: number, list: List<T>): MutableList<T> {
    this._group = group;
    this.size = list.size;
    this._views = copyArray(list._views);
    this._activeView = <any>void 0;

    return this;
  }

  immutable(): List<T> {
    var list = new List<T>(this.size, this._views);
    if(isTransientMutableList(this)) {
      this._views = <any>void 0;
      this._activeView = <any>void 0;
    }
    else {
      this._group = ++nextId; // ensure that subsequent operations don't mutate the returned immutable list
    }
    return list;
  }

  append(...values: T[]): MutableList<T>
  append(): MutableList<T> {
    var values = arguments;
    if(values.length === 0) {
      return this;
    }

    this.size += values.length;

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
      this._concat(arguments[i] instanceof List
        ? new MutableList<T>(this._group, arguments[i])
        : arguments[i]);
    }
    return this;
  }

  _clone(group: number): MutableList<T> {
    var list = new MutableList<T>(group, emptyList);
    list.size = this.size;
    list._views = copyArray(this._views);
    return list;
  }

  _concat(rightList: MutableList<T>) {
publish([this, rightList], false, `pre-concat`);
    // Note: If the left and right list are the same, change the group id to ensure that any internal structures that
    // will be mutated, and which are referentially identical on both sides, are cloned independently before mutation.

    if((this === rightList && (this._group = ++nextId)) || rightList._group !== this._group) {
log(`cloning right list so that it can be freely mutated`);
      rightList = rightList._clone(this._group);
    }

    var left = this._focusTail(),
        right = rightList._focusHead(true);

    if(left.group !== this._group) {
      this._views[this._views.length - 1] = left = left.clone(this._group);
    }
publish([this, rightList], false, `lists are now ready for mutation`);

log('initial left:', left);
log('initial right:', right);

    var level = 1;
    do {

// log(`[A] left (${left.id}) slots: ${left.slotCount()}; right (${right.id}) slots: ${right.slotCount()};`);
// log('ascend left');
      left = left.ascend(true);
// log('left is now:', left);
// log('ascend right');
      right = right.ascend(true);
// log('right is now:', right);
// log(`[B] left (${left.id}) slots: ${left.slotCount()}; right (${right.id}) slots: ${right.slotCount()};`);

      this._commit(left, level, COMMIT.RIGHT);
      this._commit(left, level, COMMIT.LEFT);

      rightList._commit(right, level, COMMIT.RIGHT);
// publish([rightList], false, `commited right list RIGHT @ level ${level}`);
      rightList._commit(right, level, COMMIT.LEFT);
// publish([rightList], false, `commited right list LEFT @ level ${level}`);

      var nodes: [Slot<T>, Slot<T>] = [left.slot, right.slot];
      if(this._join(nodes)) {
log(`replace slots`)
        left.replaceSlot(nodes[0]);
        right.replaceSlot(nodes[1]);
      }
// publish([rightList], false, `replaced slot in right list @ level ${level}`);
publish([this, rightList], false, `level ${level} committed`);

      level++;
    } while(left.slotCount() + right.slotCount() > CONST.BRANCH_FACTOR);

  }

  _focusHead(store: boolean): View<T> {
    var view = this._views[0], rvi = 1;
    this._leftViewIndex = -1;
    this._leftItemEnd = -1;

log(`[focus head] view.start: ${view.start}`)
    if(view.start > 0) {
      var level = 0;
      do {
        view = view.parent;
        level++;
log(`ascend to level ${level}`);
      } while(view.start > 0);
      while(--level >= 0) {
        var slot = <Slot<T>>view.slot.slots[0];
        view = new View<T>(this._group, 0, slot.size, 0, 0, false, view, slot);
log(`descend to level ${level}; left edge view created with id ${view.id}`);
      }

      if(store) {
        this._views = padArrayLeft(this._views, 1);
        this._views[0] = view;
      }
      else {
        rvi = 0;
      }
    }
    else if(store) {
      this._views[0] = view = view.clone(this._group);
    }

    this._rightViewIndex = rvi;
    this._rightItemStart = this._views.length > this._rightViewIndex
      ? this._views[this._rightViewIndex].start
      : Infinity;

    return view;
  }

  _focusTail(): View<T> {
    var view = last(this._views);
log(`[focus tail] view id: ${view.id}`);
    this._leftViewIndex = this._views.length - 2;
    this._leftItemEnd = this._leftViewIndex >= 0 ? this._views[this._leftViewIndex].end : -1;
    this._rightViewIndex = this._views.length;
    this._rightItemStart = Infinity;
    return view;
  }

  _commit(targetView: View<T>, targetLevel: number, direction: COMMIT): void {
    var index: number;
    if(direction === COMMIT.LEFT) {
      if((index = this._leftViewIndex) === -1 || this._leftItemEnd <= targetView.start) {
        return;
      }
log(`[commit] direction: LEFT, left index: ${this._leftViewIndex}, left end: ${this._leftItemEnd}`);
      this._leftViewIndex = index - 1;
      this._leftItemEnd = index > 0 ? this._views[this._leftViewIndex].end : -1;
    }
    else {
      if((index = this._rightViewIndex) >= this._views.length || this._rightItemStart > targetView.end) {
        return;
      }
log(`[commit] direction: RIGHT, right index: ${this._rightViewIndex}, left end: ${this._rightItemStart}`);
      this._rightViewIndex = index + 1;
      this._rightItemStart = this._rightViewIndex < this._views.length ? this._views[this._rightViewIndex].start : Infinity;
    }

    var level = 0;
    var view = this._views[index];
// log('commit A');
    if(view.group !== this._group) {
      this._views[index] = view = view.clone(this._group);
// publish([this], false, 'commit B');
    }

    while(level <= targetLevel) {
// publish([this], false, `commit C (level ${level} --> ${targetLevel})`);
      if(level === targetLevel - 1) {
// publish([this], false, 'commit D');
        view.parent = targetView;
      }

      if(direction === COMMIT.LEFT) {
// publish([this], false, 'commit E');
        view = view.ascend(true);
      }

      if(level > 0) {
// publish([this], false, 'commit F');
        this._commit(view, level, direction);
      }

      if(direction === COMMIT.RIGHT) {
// publish([this], false, 'commit G');
        view = view.ascend(true);
      }

      level++;
    }
// log('commit H');
  }

  _isOutOfRangeLeft(startIndex: number): boolean {
    return this._leftViewIndex === -1 || this._leftItemEnd <= startIndex;
  }

  _isOutOfRangeRight(endIndex: number): boolean {
    return this._rightViewIndex === -1 || this._rightItemStart > endIndex;
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
          slots = expandArray(slots, slotCount);
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
          if(levelIndex === level) {
            view.sizeDelta += delta;
          }
log(`levelIndex is 1, so view slot size is increased by its own delta to ${view.slot.size}`);
        }
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
        }
      }
publish(this, false, `subtree updated at level ${levelIndex} (remaining: ${remaining})`);
    } while(levelIndex <= level);

    leafView.changed = true;
log('DONE POPULATING SUBTREES');
    return nodeIndex;
  }
}

function isRelaxed<T>(slot: Slot<T>): boolean {
  return slot.sum > 0 || slot.recompute > 0;
}

function isDummySlot<T>(slot: Slot<T>): boolean {
  return slot.group === 0;
}

function isRootView<T>(view: View<T>): boolean {
  return view.parent === voidView;
}

function isTransientMutableList<T>(list: MutableList<T>): boolean {
  return list === _mutableList;
}

function calculateExtraSearchSteps(upperSlots: number, lowerSlots: number): number {
  var steps =  upperSlots - (((lowerSlots - 1) >>> CONST.BRANCH_INDEX_BITCOUNT) + 1);
log(`[calculate extra search steps] upper slots: ${upperSlots}, lower slots: ${lowerSlots}, result: ${steps}`);
  return steps;
}

function calculateRebalancedSlotCount(upperSlots: number, lowerSlots: number): number {
  var reduction = calculateExtraSearchSteps(upperSlots, lowerSlots) - CONST.MAX_OFFSET_ERROR;
log(`[calculate rebalanced slot count] reduction: ${reduction}; new upper slot count: ${upperSlots - (reduction > 0 ? reduction : 0)}`);
  return upperSlots - (reduction > 0 ? reduction : 0);
}

function shiftDownRoundUp(value: number, shift: number): number {
  var a = value >>> shift;
  return a + ((a << shift) < value ? 1 : 0);
}

function modulo(value: number, shift: number): number {
  return value - ((value >>> shift) << shift);
}

function concat<T>(left: T[], right: T[], spaceBetween: number): T[] {
  var arr = new Array(left.length + right.length + spaceBetween);
  for(var i = 0; i < left.length; i++) {
    arr[i] = left[i];
  }
  i += spaceBetween;
  for(var j = 0; j < right.length; i++, j++) {
    arr[i] = right[j];
  }
  return arr;
}

function padArrayLeft<T>(values: T[], amount: number): T[] {
  var arr = new Array(values.length + amount);
  for(var i = 0; i < values.length; i++) {
    arr[i + amount] = values[i];
  }
  return arr;
}

function padArrayRight<T>(values: T[], amount: number): T[] {
  return expandArray(values, values.length + amount);
}

function expandArray<T>(values: T[], newSize: number): T[] {
  var arr = new Array(newSize);
  for(var i = 0; i < values.length; i++) {
    arr[i] = values[i];
  }
  return arr;
}

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

var emptySlot = new Slot<any>(++nextId, 0, 0, 0, 0, []);
var voidView = new View<any>(++nextId, 0, 0, 0, 0, false, <any>void 0, emptySlot);
var emptyView = new View<any>(++nextId, 0, 0, 0, 0, false, voidView, emptySlot);
var emptyList = new List<any>(0, [emptyView]);
var _mutableList = new MutableList<any>(++nextId, emptyList);

function log(...args: any[])
function log() {
  publish(Array.from(arguments));
  // console.log.apply(console, arguments);
}
