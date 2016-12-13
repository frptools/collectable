import {CONST, COMMIT_MODE, OFFSET_ANCHOR, isDefined, isUndefined, invertOffset, invertAnchor, max, normalizeIndex, log, publish} from './common';
import {View} from './view';
import {ChildSlotOutParams, Slot, ExpansionParameters} from './slot';
import {ListState} from './state';

/**
 * Checks whether a list ordinal position lies within the absolute range of a slot within the list
 *
 * @param {number} ordinal
 * @param {number} leftOffset
 * @param {number} slotSize
 * @returns {boolean}
 */
function isInRange(ordinal: number, leftOffset: number, slotSize: number): boolean {
  return ordinal >= leftOffset && ordinal < leftOffset + slotSize;
}

/**
 * Checks whether a list ordinal position lies within the specified view's absolute range within the list
 *
 * @template T The type of elements in the list
 * @param {View<T>} view A view to perform a range check against
 * @param {number} ordinal An ordinal position whose existence should be checked with respect to the specified view
 * @param {number} listSize The total number of elements in the list
 * @returns {boolean} true if the ordinal falls within the view's enclosed range, otherwise false
 */
export function isViewInRange<T>(view: View<T>, ordinal: number, listSize: number): boolean {
  return view.anchor === OFFSET_ANCHOR.LEFT
    ? isInRange(ordinal, view.offset, view.slot.size)
    : isInRange(ordinal, invertOffset(view.offset, view.slot.size, listSize), view.slot.size);
}

/**
 * Checks an upper view's offset and size to see if it is an ancestor of the lower view
 *
 * @template T The type of elements in the list
 * @param {View<T>} upperView An ancestral view
 * @param {View<T>} lowerView A descendant view
 * @param {number} listSize The total number of elements in the list
 * @returns {boolean} true if upperView is an ancestor of lowerView, otherwise false
 */
function isAncestor<T>(upperView: View<T>, lowerView: View<T>, listSize: number): boolean {
log(`[isAncestor] list size: ${listSize}, lower view ${lowerView.id} offset: ${lowerView.offset}, anchor: ${lowerView.anchor}, size: ${lowerView.slot.size}; upper view ${upperView.id} offset: ${upperView.offset}, anchor: ${upperView.anchor}, size: ${upperView.slot.size}`);
  var upperOffset = lowerView.anchor === upperView.anchor ? upperView.offset
                  : invertOffset(upperView.offset, upperView.slot.size + lowerView.sizeDelta, listSize);
log(`upperOffset (${upperOffset}) <= lowerView.offset (${lowerView.offset}) && upperOffset (${upperOffset}) + upperView.slot.size (${upperView.slot.size + lowerView.sizeDelta}) >= lowerView.offset (${lowerView.offset}) + lowerView.slot.size (${lowerView.slot.size})`);
  return upperOffset <= lowerView.offset && upperOffset + upperView.slot.size + lowerView.sizeDelta >= lowerView.offset + lowerView.slot.size;
}

/**
 * Selects and returns either the left or the right view for further operations at the specified ordinal position. The
 * view is selected with a preference for preserving the position of the last view that was written to, so that the
 * reading and writing of views will implicitly optimise itself according to the way the list is being used.
 *
 * @param {ListState<T>} state The list state to be queried
 * @param {number} ordinal A hint to indicate the next ordinal position to be queried
 * @returns {View<T>} One of either the left or the right view
 *
 * @memberOf ListState
 */
function selectView<T>(state: ListState<T>, ordinal: number, asWriteTarget: boolean): View<T> {
  var left = state.left, right = state.right, resolve = asWriteTarget;
  var anchor: OFFSET_ANCHOR;
  if(left.isNone()) {
log(`left is none, right is root: ${right.isRoot()}`);
    anchor = right.isRoot() || isInRange(ordinal, invertOffset(right.offset, right.slot.size, state.size), right.slot.size)
      ? OFFSET_ANCHOR.RIGHT : OFFSET_ANCHOR.LEFT;
    if(anchor === OFFSET_ANCHOR.LEFT) resolve = true;
  }
  else if(right.isNone()) {
log(`right is none, left is root: ${right.isRoot()}`);
    anchor = left.isRoot() || isInRange(ordinal, left.offset, left.slot.size)
      ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;
    if(anchor === OFFSET_ANCHOR.RIGHT) resolve = true;
  }
  else {
log(`left and right exist; selecting...`);
    var leftEnd = left.bound();
    var rightStart = state.size - right.bound();
    anchor = rightStart <= ordinal ? OFFSET_ANCHOR.RIGHT
      : leftEnd > ordinal ? OFFSET_ANCHOR.LEFT
      : invertAnchor(state.lastWrite);
  }
log(`selecting ${anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} view for ${asWriteTarget ? 'WRITING' : 'READING'}`);
  return resolve
    ? state.getView(anchor, asWriteTarget, ordinal)
    : anchor === OFFSET_ANCHOR.LEFT ? left : right;
}

export class TreeWorker<T> {
  private static _defaults: {
    defaultPrimary: TreeWorker<any>;
    defaultSecondary: TreeWorker<any>;
    defaultOther: TreeWorker<any>;
    defaultTemporary: TreeWorker<any>;
  };

  private static _getDefaults() {
    var defaults = TreeWorker._defaults;
    if(isUndefined(defaults)) {
      TreeWorker._defaults = defaults = {
        defaultPrimary: new TreeWorker<any>(),
        defaultSecondary: new TreeWorker<any>(),
        defaultOther: new TreeWorker<any>(),
        defaultTemporary: new TreeWorker<any>(),
      };
    }
    return defaults;
  }

  static defaultPrimary<T>(): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultPrimary;
  }

  static defaultSecondary<T>(): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultSecondary;
  }

  static defaultOther<T>(): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultOther;
  }

  static defaultTemporary<T>(): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultTemporary;
  }

  static refocusView<T>(state: ListState<T>, view: View<T>, ordinal: number, asAltView: boolean, asWriteTarget: boolean) {
    var worker = TreeWorker.defaultTemporary<T>().reset(state, view, state.group);
    view = worker.refocusView(ordinal, asAltView, asWriteTarget);
    worker.dispose();
    return view;
  }

  static focusOrdinal<T>(state: ListState<T>, ordinal: number, asWriteTarget: boolean): View<T>|undefined {
log(`[focusOrdinal: ${ordinal}] state.size: ${state.size}`);
    ordinal = normalizeIndex(state.size, ordinal);
    if(ordinal === -1) return void 0;
    var view = selectView(state, ordinal, asWriteTarget);
// publish(state, true, `view selected prior to refocusing`);
    return isViewInRange(view, ordinal, state.size) ? view
      : TreeWorker.refocusView<T>(state, view, ordinal, false, asWriteTarget);
  }

  static focusEdge<T>(state: ListState<T>, edge: OFFSET_ANCHOR, asWriteTarget: boolean): View<T> {
    var view = state.getView(edge, asWriteTarget);
log(`view offset: ${view.offset}, write target: ${asWriteTarget}, slot reserved: ${view.slot.isReserved()}, root: ${view.isRoot()}`);
    view = view.offset > 0 || (asWriteTarget && !view.slot.isReserved() && !view.isRoot())
      ? TreeWorker.refocusView<T>(state, view, edge === OFFSET_ANCHOR.LEFT ? 0 : state.size - 1, false, asWriteTarget)
      : view;
publish(state, false, `edge focused as ${asWriteTarget ? 'WRITE' : 'READ'} target`);
    return view;
  }

  static focusHead<T>(state: ListState<T>, asWriteTarget: boolean): View<T> {
log(`[focusHead]`);
    return TreeWorker.focusEdge(state, OFFSET_ANCHOR.LEFT, asWriteTarget);
  }

  static focusTail<T>(state: ListState<T>, asWriteTarget: boolean): View<T> {
log(`[focusTail]`);
    return TreeWorker.focusEdge(state, OFFSET_ANCHOR.RIGHT, asWriteTarget);
  }

  static focusView<T>(state: ListState<T>, ordinal: number, anchor: OFFSET_ANCHOR, asWriteTarget: boolean): View<T> {
    var view = state.getView(anchor, true, ordinal);
    return isViewInRange(view, ordinal, state.size) ? view
      : TreeWorker.refocusView<T>(state, view, ordinal, false, true);
  }

  state = ListState.empty<T>(false);
  previous = View.none<T>();
  current = View.none<T>();
  other = View.none<T>();
  otherCommittedChild = View.none<T>();
  otherCommitMode: COMMIT_MODE = -1;
  committedOther = false;
  slotResult = {slot: Slot.empty<T>(), index: 0, offset: 0};
  group = 0;
  shift = 0;

  isRoot(): boolean {
    return this.current.isRoot();
  }

  hasOtherView(): boolean {
    return !this.other.isNone();
  }

  isOtherViewUncommitted(): boolean {
    return !this.committedOther && !this.other.isNone();
  }

  reset(state: ListState<T>, view: View<T>, group, otherCommitMode = COMMIT_MODE.NO_CHANGE): TreeWorker<T> {
log(`reset tree worker with view ${view.id}, slot ${view.slot.id}`);
    this.state = state;
    this.current = view;
    this.group = group;
    this.shift = 0;
    if(otherCommitMode === -1) {
      this.committedOther = true;
    }
    else {
      this.other = state.getOtherView(view.anchor);
      this.committedOther = this.other.isNone();
      this.otherCommitMode = otherCommitMode;
    }
    return this;
  }

  dispose(): void {
    this.state = ListState.empty<T>(false);
    this.previous = View.none<T>();
    this.current = View.none<T>();
    this.other = View.none<T>();
    this.otherCommittedChild = View.none<T>();
    this.slotResult.slot = Slot.empty<T>();
  }

  ascend(mode: COMMIT_MODE, expandParent?: ExpansionParameters): View<T> {
    var childView = this.current;
    var childSlot = childView.slot;
    var group = this.group;
    var parentView: View<T>;
    var parentSlot: Slot<T>;
    var hasChanges: boolean;
log(`[ASCEND: ${mode === COMMIT_MODE.NO_CHANGE ? 'NO CHANGE' : mode === COMMIT_MODE.RESERVE ? 'RESERVE' : mode === COMMIT_MODE.RELEASE ? 'RELEASE' : 'RELEASE/DISCARD'}] child view: ${childView.id}, is root: ${childView.isRoot()}, changes: ${childView.hasUncommittedChanges()}`);

    if(childSlot.size === 0) {
      console.warn(`unhandled edge case warning: ascending from child slot that has no elements (group: ${childView.group}, slot index: ${childView.xslotIndex})`);
    }

    if(this.committedOther && !this.otherCommittedChild.isNone()) {
      this.otherCommittedChild = View.none<T>();
    }

    var persistChild = mode === COMMIT_MODE.RELEASE_DISCARD ? (mode = COMMIT_MODE.RELEASE, false) : true;
    var slotIndex = childView.xslotIndex;

    if(childView.isRoot()) {
      // Ascending from the root slot causes the tree to grow by one level. Non-zero delta values for the child view can
      // be disregarded, as we're absorbing the child view's final computed values in advance.
      var slotCount = 1, slotSize = childSlot.size;
      var recompute = childSlot.isRelaxed() ? slotCount : -1;
      if(isDefined(expandParent)) {
        slotCount += expandParent.padLeft + expandParent.padRight;
        slotIndex += expandParent.padLeft;
        slotSize += expandParent.sizeDelta;
        if(recompute !== -1) {
          recompute += max(expandParent.padRight, -1);
        }
        this.state.size += expandParent.sizeDelta;
      }
      var slots = new Array<Slot<T>>(slotCount);
      slots[slotIndex] = mode === COMMIT_MODE.RESERVE ? childSlot.cloneAsPlaceholder(group) : childSlot;
      parentSlot = new Slot<T>(group, slotSize, 0, recompute, childSlot.slots.length, slots);
      parentView = View.create<T>(group, childView.offset, childView.anchor, 0, 0, 0, View.none<T>(), parentSlot);
log(`grow the tree by one level; parent view: ${parentView.id}, slot: ${parentSlot.id}, slots: ${slotCount}, recompute: ${parentSlot.recompute}`);
      hasChanges = false;
    }
    else {
      parentView = childView.xparent.ensureEditable(group);
      parentSlot = parentView.slot;
      var hasChanges = childView.hasUncommittedChanges();
log(parentView, this.other, this.state.size);
      var prepend = 0, append = 0;

      // If the child wasn't already reserved with a placeholder slot, and no reservation has been requested, then there is
      // nothing further that we need to do.
      if(hasChanges || mode === COMMIT_MODE.RESERVE || isDefined(expandParent)) {
        // Optional expansion parameters can add slots to the start or end of the parent slot.
        if(isDefined(expandParent)) {
          append = expandParent.padRight;
          prepend = expandParent.padLeft;
log(`parent slot ${parentSlot.id} will be size-adjusted; child slot index: ${slotIndex}, current size: ${parentSlot.size}, recompute: ${parentSlot.recompute}, left: ${expandParent.padLeft} slots, right: ${expandParent.padRight} slots, size delta: ${expandParent.sizeDelta} + ${childView.sizeDelta}`);
          slotIndex += prepend;
log(`slotIndex is now ${slotIndex}`);
        }

        // Prepare the parent view and slot for modifications, and optionally append or prepend additional slots as needed.
        if(!parentSlot.isEditable(group)) {
          // Note that it is impossible for a slot to be a member of the current group if the view referencing it is not.
          parentView.slot = parentSlot = isDefined(expandParent)
            ? parentSlot.cloneWithAdjustedRange(group, prepend, append, false, true)
            : parentSlot.cloneToGroup(group, true);
        }
        else if(isDefined(expandParent)) {
          parentSlot.adjustRange(prepend, append, false);
        }
log(`parent slot recompute is now: ${parentSlot.recompute}`);

        if(isDefined(expandParent)) {
          this.state.size += expandParent.sizeDelta;
          if((prepend && parentView.anchor === OFFSET_ANCHOR.LEFT) || (!prepend && parentView.anchor === OFFSET_ANCHOR.RIGHT)) {
log(`flipping parent view ${parentView.id} anchor ${parentView.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} prior to node expansion; view size: ${parentView.slot.size}, list size: ${this.state.size}`);
            parentView.flipAnchor(this.state.size - childView.sizeDelta - expandParent.sizeDelta);
          }
        }
log(`parent slot size is now: ${parentSlot.size}`);

log(`is other committed? ${this.committedOther}, is ancestor: ${isAncestor(childView.xparent, this.other, this.state.size)}`);
        if(!this.committedOther && isAncestor(parentView, this.other, this.state.size)) {
publish(this.state, false, `pre-commit (prepend: ${prepend})`);
          this.commitOther(parentView, prepend);
publish(this.state, false, 'commit done');
        }

        // If the direction of expansion is the same as the current offset anchor, the offset anchor must be flipped so that
        // the relative offset is not invalidated by the expanded size of the slot. If expanding both sides, offset
        // adjustments will need to be calculated externally.
        if(isDefined(expandParent)) {
          parentSlot.size += expandParent.sizeDelta;
log(`[PARENT EXPAND] parent slot size changed from ${parentSlot.size - expandParent.sizeDelta} to: ${parentSlot.size}`);
          if(!parentView.isRoot()) {
            parentView.sizeDelta += expandParent.sizeDelta;
          }
        }

        // Pending changes to the list size and parent slot subcount need to be propagated upwards. Before any further
        // operations are performed, the calling function should also commit changes from the other (left/right) view if
        // they descend from this branch, or the returned slot/view may not reflect the true state of the list.
        if(hasChanges) {
log(`child slot index: ${slotIndex}`);
          if(!parentView.isRoot()) {
            parentView.sizeDelta += childView.sizeDelta;
          }
          parentSlot.subcount += childView.slotsDelta;
          parentSlot.size += childView.sizeDelta;
log(`[CHILD DELTA] parent slot size changed from ${parentSlot.size - childView.sizeDelta} to: ${parentSlot.size}`);

log(`parent slot ${parentSlot.id} is relaxed: ${parentSlot.isRelaxed()}, parentSlot.recompute: ${parentSlot.recompute}, parentSlot.slots.length: ${parentSlot.slots.length}, slotIndex: ${slotIndex}, append: ${append}`);
          if(parentSlot.isRelaxed() || childSlot.isRelaxed() || (childView.slotsDelta < 0 && slotIndex < parentSlot.slots.length - 1 && parentSlot.recompute === -1)) {
log(`[C] reset recompute to 0 to allow it to be recalculated`);
            parentSlot.recompute = max(parentSlot.recompute, parentSlot.slots.length - slotIndex);
          }
          else {
            parentSlot.recompute = -1;
          }
publish(this.state, false, `recompute updated`);
          // if(parentSlot.isRelaxed() || childSlot.isRelaxed()) {
          //   parentSlot.recompute = parentSlot.isRelaxed()
          //     ? max(parentSlot.recompute, parentSlot.slots.length - slotIndex + (append ? append : 0))
          //     : parentSlot.slots.length;
          // }
          // else {
          //   parentSlot.recompute = -1;
          // }
log(`[E] recompute is now: ${parentSlot.recompute}`);
        }
      }

      // Avoid dragging around extraneous references to old state that will be invalidated by any subsequent writes to
      // descendant nodes.
      if(mode === COMMIT_MODE.RESERVE || (hasChanges && mode === COMMIT_MODE.NO_CHANGE && childSlot.isReserved())) {
        var childSlotRef = <Slot<T>>parentSlot.slots[slotIndex];
        if(childSlotRef.isReservedFor(group)) {
          if(hasChanges) {
            childSlotRef.size = childSlot.size;
            childSlotRef.slots.length = childSlot.slots.length;
          }
        }
        else {
          var sum = childSlotRef.sum;
          parentSlot.slots[slotIndex] = childSlotRef = childSlot.cloneAsPlaceholder(group);
          childSlotRef.sum = sum;
        }

        if(childSlotRef.isReservedFor(group)) {
          if(hasChanges) {
            childSlotRef.updatePlaceholder(childSlot);
          }
        }
        else {
          parentSlot.slots[slotIndex] = childSlot.cloneAsPlaceholder(group);
        }
      }
      else if(mode === COMMIT_MODE.RELEASE) {
        if(childSlot.isReserved()) {
log(`child slot ${childSlot.id} is reserved`);
          if(!parentSlot.isEditable(group)) {
log(`clone parent slot ${parentSlot.id}`);
            parentView.slot = parentSlot = parentSlot.cloneToGroup(group, true);
          }
          if(childSlot.isEditable(group)) {
            childSlot.group = group;
          }
          else {
log(`clone child slot ${childSlot.id} at index ${slotIndex}`);
            childSlot = childSlot.cloneToGroup(group);
          }
log(`assign child slot ${childSlot.id} to parent slot ${parentSlot.id} at index ${slotIndex}`);
          childSlot.sum = (<Slot<T>>parentSlot.slots[slotIndex]).sum;
          parentSlot.slots[slotIndex] = childSlot;
        }
      }
    }

    // If the slot is flagged as relaxed, but it is now full, change it back to a regular node.
    if(parentSlot.recompute !== -1 && parentSlot.size === CONST.BRANCH_FACTOR << (this.shift + CONST.BRANCH_INDEX_BITCOUNT)) {
      parentSlot.recompute = -1;
    }

    if(!this.committedOther && isAncestor(parentView, this.other, this.state.size)) {
      this.commitOther(parentView, 0);
publish(this.state, false, 'commit done');
    }

log(`persist child: ${persistChild}`);
    if(persistChild/* || true*/) {
      if(mode === COMMIT_MODE.RESERVE && !childSlot.isReserved()) {
        if(childSlot.isEditable(group)) {
          childSlot.group = -group;
        }
        else {
          childSlot = childSlot.cloneToGroup(-group);
        }
      }

      if(!childView.isEditable(group)) {
        childView = childView.cloneToGroup(group);
        if(this.shift === 0) {
          this.state.setView(childView);
        }
      }

      if(hasChanges || childSlot !== childView.slot || childView.xparent !== parentView || this.otherCommitMode === -1) {
        childView.slot = childSlot;
if(childView === parentView) {
  throw new Error('Cannot assign view as its own parent');
}
        childView.xparent = parentView;
        childView.slotsDelta = 0;
        childView.sizeDelta = 0;
      }
      childView.xslotIndex = slotIndex;
log(`slotIndex is ${slotIndex}`);
      this.previous = childView;
    }
    else if(childView.isEditable(group)) {
      View.pushReusableView(childView);
    }

    this.current = parentView;
    this.shift += CONST.BRANCH_INDEX_BITCOUNT;

    return parentView;
  }

  commitOther(replacementParent: View<T>, slotIndexOffset: number): void {
    var otherView = this.other;
    if(slotIndexOffset === 0 && this.shift === 0 && !otherView.hasUncommittedChanges()
      && otherView.xparent === replacementParent
      && (this.otherCommitMode === COMMIT_MODE.NO_CHANGE
       || (this.otherCommitMode === COMMIT_MODE.RESERVE) === otherView.slot.isReserved())) {
      this.committedOther = true;
      this.otherCommittedChild = otherView;
      return;
    }

    if(!otherView.isEditable(this.group)) {
      otherView = otherView.cloneToGroup(this.group);
    }
    var anchor = otherView.anchor;
log(`[commitOther] begin commit other view ${otherView.id} from state ${this.state.id} (shift: ${this.shift}) up to parent ${replacementParent.id}`);


    this.state.setView(this.other = this.otherCommitMode === COMMIT_MODE.RELEASE_DISCARD ? View.empty<T>(anchor) : otherView);

    var worker = TreeWorker.defaultOther<T>().reset(this.state, otherView, this.group, -1);

    var xx = 0;
    while(worker.shift < this.shift) {
      if(++xx === 10) {
        throw new Error('Infinite loop (commit other)');
      }
var id = otherView.id;
      otherView = worker.ascend(this.otherCommitMode);
log(`other view ${id} ascended to view ${otherView.id}`);
    }

if(otherView === replacementParent) {
  throw new Error('Cannot assign replacement view as its own parent');
}
    otherView.xparent = replacementParent;
    otherView.xslotIndex += slotIndexOffset;
    worker.ascend(this.otherCommitMode);
    this.committedOther = true;
    this.otherCommittedChild = worker.previous;
    worker.dispose();
publish(this.state, false, `Done committing other view`);
  }

  ascendToOrdinal(ordinal: number, mode: COMMIT_MODE, ensureBranchReserved: boolean): View<T> {
    var view = this.current, target = view, branchFound = false;
log(`[ascendToOrdinal (${ordinal})] view: ${view.id}${!branchFound ? '' : `, branch was found earlier, but still ascending to complete reservation process`}`);
    var shift = this.shift;
    var xx = 0;

    do {
      if(++xx === 10) {
        throw new Error('Infinite loop (refocus view - ascend)');
      }

      view = this.ascend(this.isOtherViewUncommitted() || mode === COMMIT_MODE.RESERVE ? mode : COMMIT_MODE.NO_CHANGE);
      if(!branchFound) {
        branchFound = isViewInRange(view, ordinal, this.state.size);
log(`[ascendToOrdinal] view: ${view.id}, branch found: ${branchFound}, node is reserved: ${view.slot.isReserved()}`);
        if(branchFound) {
          shift = this.shift;
          target = view;
          if(ensureBranchReserved) {
            mode = COMMIT_MODE.RESERVE;
          }
        }
      }
    } while(!branchFound || (mode === COMMIT_MODE.RESERVE && !view.isRoot() && !view.slot.isReserved()));

    this.shift = shift;
    this.current = target;
log(`[ascendToOrdinal] ascent completed at view: ${view.id}`);
    return target;
  }

  descendToOrdinal(ordinal: number, asWriteTarget: boolean): View<T>|undefined {
    var view = this.current, shift = this.shift, out = this.slotResult;
    var offset = view.anchor === OFFSET_ANCHOR.RIGHT ? invertOffset(view.offset, view.slot.size, this.state.size) : view.offset;
    var xx = 0;
log(`[descendToOrdinal (${ordinal})] left offset: ${offset}, localised ordinal ${ordinal - offset}, shift: ${shift}`);
    do {
      if(++xx === 10) {
        throw new Error('Infinite loop (descend)');
      }
      view.slot.resolveChild(ordinal - offset, shift, out);
      if(out.slot.isReserved()) {
        xx = 0;
        while(view !== this.current) {
          if(++xx === 10) {
            throw new Error('Infinite loop (descend/dispose)');
          }
          var discarded = view, view = discarded.xparent;
          View.pushReusableView(discarded);
        }
        return void 0;
      }
      shift -= CONST.BRANCH_INDEX_BITCOUNT;
      offset += out.offset;
      if(asWriteTarget) {
        view.ensureSlotEditable().slots[out.index] = out.slot.cloneAsPlaceholder(this.group);
        out.slot = out.slot.toReservedNode(this.group);
      }
      view = View.create<T>(this.group, offset, OFFSET_ANCHOR.LEFT, out.index, 0, 0, view, <Slot<T>>out.slot);
    } while(shift > 0);

    this.previous = this.current;
    this.current = view;
    this.shift = 0;

    return view;
  }

  refocusView(ordinal: number, asAltView: boolean, asWriteTarget: boolean): View<T> {
    ordinal = normalizeIndex(this.state.size, ordinal);
    var anchor = asAltView ? invertAnchor(this.current.anchor) : this.current.anchor;
log(`[refocusView] refocusing view ${this.current.id} to ordinal ${ordinal} (as write target: ${asWriteTarget}, alternate view: ${asAltView})`);
    this.ascendToOrdinal(ordinal, asAltView ? COMMIT_MODE.NO_CHANGE : COMMIT_MODE.RELEASE_DISCARD, asWriteTarget);
    var view = this.descendToOrdinal(ordinal, asWriteTarget);

    if(isUndefined(view)) {
log(`[refocusView] cannot descend further; will attempt to focus via the other view`);
publish(this.state, false, `list state prior to refocusing via alternate view`);
      this.reset(this.state, this.state.getOtherView(anchor), this.group, -1);
      this.ascendToOrdinal(ordinal, COMMIT_MODE.NO_CHANGE, false);
      view = <View<T>>this.descendToOrdinal(ordinal, asWriteTarget);
    }
log(`[refocusView] descended to view ${view.id}`, view);
    if(view.anchor !== anchor) {
      view.flipAnchor(this.state.size);
    }
    this.state.setView(view);
publish(this.state, false, `list state after refocusing to view ${view.id}, ordinal ${ordinal}`);
    return view;
  }
}

// /**
//  * Commits changes to the child view to the parent view, then returns the parent view. If the parent is not of the
//  * current group, it is first cloned before any changes are applied. If the supplied view is already the root view, a
//  * new root is created with the supplied view's slot as the sole child slot. The returned parent view and slot will only
//  * have been updated to the current group number if necessary, as per the value of the `mode` argument.
//  *
//  * Note that this function does not mutate the child view or slot. If the child view is to be retained after this
//  * operation, ensure it is of the correct group, then call {@link View#setCommitted}.
//  *
//  * @export
//  * @template T The type of elements present in the list
//  * @param {number} group The identifier for the current batch of operations
//  * @param {View<T>} view The child view for which a parent is required
//  * @param {COMMIT_MODE} mode If COMMIT_MODE.RELEASE, and the parent currently uses a placeholder slot for the child,
//  *     the child slot will be assigned back to the parent. If COMMIT_MODE.RESERVE, and no placeholder slot currently
//  *     represents the child within its parent, the parent will be assigned a placeholder slot to represent the child
//  *     before being returned.
//  * @returns {View<T>} The parent view, with any size-related changes applied from the child to the parent view and/or slot.
//  */
// export function ascend<T>(group: number, childView: View<T>, fromLeaf: boolean, mode: COMMIT_MODE, expand?: ExpansionParameters): View<T> {
//   var childSlot = childView.slot;

//   if(childSlot.size === 0) {
//     console.warn(`unhandled edge case warning: ascending from child slot that has no elements (group: ${childView.group}, slot index: ${childView.slotIndex})`);
//   }

// log(`[ASCEND] from view (${childView.id}), is root: ${childView.isRoot()}, has changed: ${childView.hasUncommittedChanges()}, mode: ${mode === COMMIT_MODE.NO_CHANGE ? 'NO CHANGE' : mode === COMMIT_MODE.RELEASE ? 'RELEASE' : 'RESERVE'}, slot index: ${childView.slotIndex}`);
//   // Ascending from the root slot effectively means growing the tree by one level.
//   if(childView.isRoot()) {
//     // Non-zero delta values for the child view can be disregarded, as we're absorbing the child view's final computed
//     // values in advance.
//     // if(isDefined(expand)) {
//     //   expand.next(1);
//     // }
//     return new View<T>(group, childView.offset, childView.anchor, 0, 0, 0, View.none<T>(), childSlot.createParent(group, mode, expand));
//   }

//   var hasChanges = childView.hasUncommittedChanges();
//   var parentView = childView.xparent;
//   var parentSlot = parentView.slot;
// log(`parent view has offset ${parentView.offset}, slots: ${parentSlot.slots.length}, changes;sizeDelta:`, hasChanges, childView.sizeDelta);

//   // If the child wasn't already reserved with a placeholder slot, and no reservation has been requested, then there is
//   // nothing further that we need to do.
//   if(!hasChanges && isUndefined(expand) && mode !== COMMIT_MODE.RESERVE && !childSlot.isReserved()) {
// log(`clean parent retrieval with no modifications to the child`);
//     return parentView;
//   }

//   var slotIndex = childView.slotIndex;
//   if(hasChanges || mode === COMMIT_MODE.RESERVE || isDefined(expand) || (childSlot.isReserved() && mode === COMMIT_MODE.RELEASE)) {
//     // Optional expansion parameters can add slots to the start or end of the parent slot.
//     var prepend = 0, append = 0;
//     if(isDefined(expand)) {
// log(`(expand) pad left: ${expand.padLeft}, pad right: ${expand.padRight}, size delta: ${expand.sizeDelta}`);
//       // expand.next(parentSlot.slots.length);
//       append = expand.padRight;
//       prepend = expand.padLeft;
//       slotIndex += prepend;
// log(`slot index increased by ${prepend} to ${slotIndex}`);
//       // if(expand.prepend) {
//       // }
//       // else {
//       // }
//     }

//     // Prepare the parent view and slot for modifications, and optionally append or prepend additional slots as needed.
//     if(!parentSlot.isEditable(group)) {
// log(`parent slot ${parentSlot.id} will be cloned from group ${parentSlot.group} to group ${group} (mode: ${mode})`);
//       // Note that it is impossible for a slot to be a member of the current group if the view referencing it is not.
//       if(!parentView.isEditable(group)) {
//         parentView = parentView.cloneToGroup(group);
//       }
//       parentSlot = append || prepend
//         ? parentSlot.cloneWithAdjustedRange(group, prepend, append, false, true)
//         : parentSlot.cloneToGroup(group, true);
//       if(mode === COMMIT_MODE.RESERVE && !parentSlot.isReserved()) {
//         parentSlot.group = -group;
//       }
//       parentView.slot = parentSlot;
//     }
//     else if(append || prepend) {
//       parentSlot.adjustRange(prepend, append, false);
//     }
// log(`parent view ${parentView.id} has offset ${parentView.offset}, has changes:`, hasChanges);
//     // If the direction of expansion is the same as the current offset anchor, the offset anchor must be flipped so that
//     // the relative offset is not invalidated by the expanded size of the slot. If expanding both sides, offset
//     // adjustments will need to be calculated externally.
//     if(isDefined(expand)) {
// //       if((expand.padLeft && !expand.padRight && parentView.anchor === OFFSET_ANCHOR.LEFT) ||
// //          (expand.padRight && !expand.padLeft && parentView.anchor === OFFSET_ANCHOR.RIGHT)) {
// // log(`view ${parentView.id} anchor will be flipped to prevent offset invalidation resulting from slot expansion`);
// //         parentView.flipAnchor((<ExpansionState>expand).totalSize - childView.sizeDelta);
// //       }
//       parentSlot.size += expand.sizeDelta;
//       if(!parentView.isRoot()) {
//         parentView.sizeDelta += expand.sizeDelta;
//       }
// log(`due to expansion, parent slot size increased to ${parentSlot.size}, size delta changed to ${parentView.sizeDelta}`);
//     }
// log(`parent view has offset ${parentView.offset}`, hasChanges);
//     // Pending changes to the list size and parent slot subcount need to be propagated upwards. Before any further
//     // operations are performed, the calling function should also commit changes from the other (left/right) view if
//     // they descend from this branch, or the returned slot/view may not reflect the true state of the list.
//     if(hasChanges) {
//       if(!parentView.isRoot()) {
//         parentView.sizeDelta += childView.sizeDelta;
//       }
//       parentSlot.subcount += childView.slotsDelta;
//       parentSlot.size += childView.sizeDelta;

//       if(childView.slotsDelta < 0 && slotIndex < parentSlot.slots.length - 1 && parentSlot.recompute === -1) {
// log(`recompute set to 0, prior to recalculation`);
//         parentSlot.recompute = 0;
//       }
//       childView.setCommitted(parentView);

// log(`due to uncommitted changes from child view ${childView.id}, parent slot size increased by ${childView.sizeDelta} to ${parentSlot.size}, size delta is now ${parentView.sizeDelta}`);
//       // If the child or parent is a relaxed slot, set the recompute count to ensure that accumulated sums are updated
//       // before any further descent from the parent slot takes place.
//       if(parentSlot.isRelaxed() || childSlot.isRelaxed()) {
//         parentSlot.recompute = parentSlot.isRelaxed()
//           ? max(parentSlot.recompute, parentSlot.slots.length - slotIndex)
//           : parentSlot.slots.length;
// log(`recompute is now ${parentSlot.recompute}`);
//       }
//       else {
//         parentSlot.recompute = -1;
//       }
//       // Avoid dragging around extraneous references to old state that will be invalidated by any subsequent writes to
//       // descendant nodes.
// log(`mode: ${mode}, has changes: ${hasChanges}, child slot reserved: ${childSlot.isReserved()}`, childSlot);
//       if(mode === COMMIT_MODE.RESERVE || (hasChanges && childSlot.isReserved())) {
//         var oldChildSlot = <Slot<T>>parentSlot.slots[slotIndex];
//         if(oldChildSlot.isReservedFor(group)) {
//           oldChildSlot.updatePlaceholder(childSlot);
//         }
//         else {
//           parentSlot.slots[slotIndex] = childSlot.cloneAsPlaceholder(group);
//         }
//       }
//     }

//     // Kill off any obsolete placeholder slots that are no longer needed.
// log(`child slot ${childSlot.id} is reserved: ${childSlot.isReserved()}, mode: ${mode}`);
//     if(mode === COMMIT_MODE.RELEASE) {
//       if(childSlot.isReserved()) {
//         if(childSlot.isReservedFor(group)) {
//           childSlot.group = group;
//         }
//         else {
//           childSlot = childSlot.cloneToGroup(group);
//         }
//         childSlot.sum = (<Slot<T>>parentSlot.slots[slotIndex]).sum;
//       }
//       parentSlot.slots[slotIndex] = childSlot;
//     }
//   }

//   return parentView;
// }

/**
 * Propagates changes from the other (left/right) view to each parent view up the tree to a common ancestral branch node.
 * If the ancestral node (see the replacementParent argument) is not an ancestor of the other view, then the operation
 * is not performed, and false is returned.
 *
 * @export
 * @template T The type of elements present in the list
 * @param {ListState<T>} state The list state to be modified
 * @param {View<T>} otherView A reference to the "other" view (left/right)
 * @param {View<T>} expectedParent A common ancestral view that the other view is expected to have a direct or indirect reference to
 * @param {View<T>} replacementParent A view that the other view should directly or indirectly reference after changes have been propagated upward
 * @param {number} slotIndexOffset A value representing the change (if any) in the number of preceding slots in the replacement view
 * @returns {boolean} true if the other view's changes were applied, otherwise false
 */
// export function tryCommitOtherView<T>(state: ListState<T>, otherView: View<T>, expectedParent: View<T>, replacementParent: View<T>, slotIndexOffset: number, mode: COMMIT_MODE): View<T>|undefined {
// log(`try commit other view ${otherView.id} (state group: ${state.group}, state size: ${state.size}, other view group: ${otherView.group}, expected parent: ${expectedParent.id}, replacement parent: ${replacementParent.id}), slot index offset: ${slotIndexOffset}`);
// publish(state, false, `BEGIN try commit other view`);
// log(`expected parent:`, expectedParent);
// log(`replacement parent:`, replacementParent);
//   if(!isAncestor(replacementParent, otherView, state.size)) {
// log(`not an ancestor. commit will be skipped.`);
//     return void 0;
//   }
// log(`----- BEGIN COMMIT OTHER VIEW -----`);
// log(`other view (${otherView.id}) is a descendant of upper view ${expectedParent.id}`);

//   if(!otherView.isEditable(state.group)) {
//     otherView = otherView.cloneToGroup(state.group);
//     state.setView(otherView);
// log(`other view updated to group ${state.group}`);
//   }

//   var shift = 0;
//   var xx = 0;
//   while(otherView.xparent !== expectedParent) {
//     if(++xx === 10) {
//       throw new Error('Infinite loop (try commit other)');
//     }
//     otherView.ensureSlotEditable(mode === COMMIT_MODE.RELEASE);
// publish(state, false, `commit: pre-ascend`);
//     var otherParent = ascend(state.group, otherView, shift === 0, mode);
// publish(state, false, `commit: post-ascend`);
//     if(!otherParent.isEditable(state.group)) {
//       otherParent = otherParent.cloneToGroup(state.group);
//     }
//     otherView.setCommitted(otherParent);
//     otherView.ensureStatus(mode, false);
//     otherView = otherParent;

//     shift += CONST.BRANCH_INDEX_BITCOUNT;
// publish(state, false, `end of loop ascending to find common parent`);
//   }

// log(`updating other view to point at replacement parent ${replacementParent.id} instead of ${expectedParent.id}`);
//   otherView.xparent = replacementParent;
//   otherView.slotIndex += slotIndexOffset;
//   otherView.ensureSlotEditable(mode === COMMIT_MODE.RELEASE);
// publish(state, false, `commit: pre-ascend`);
//   ascend(state.group, otherView, shift === 0, mode);
// publish(state, false, `commit: post-ascend`);
//   otherView.setCommitted();
//   otherView.ensureStatus(mode, false);

// log(`----- END COMMIT OTHER VIEW -----`);
// publish(state, false, `END commit other view`);
//   return otherView;
// }

/**
 * Ascends a view's ancestral path and then descends to a view in a different branch until it reaches a leaf node that
 * owns the specified ordinal position within the list.
 *
 * @template T The type of elements present in the list
 * @param {ListState<T>} state The list state to be modified
 * @param {View<T>} view The view that will be refocused
 * @param {number} ordinal The list ordinal position to refocus the specified view to point at
 * @param {boolean} asWriteTarget Ensures that the refocused view path is in a writable state
 * @returns {View<T>} A view referencing a leaf node that owns the specified ordinal position
 */
// export function refocusView<T>(state: ListState<T>, view: View<T>, ordinal: number, asWriteTarget: boolean, preserveStatus: boolean = false): View<T> {
//   ordinal = normalizeIndex(state.size, ordinal);
// log(`[refocusView] refocusing view ${view.id} to ordinal ${ordinal} (as write target: ${asWriteTarget})`);
//   var shift = 0;
//   var anchor = view.anchor;
//   var otherView = state.getOtherView(anchor);
//   var hasOtherView = !otherView.isNone(), isOtherViewUncommitted = true;
//   var mode = preserveStatus ? COMMIT_MODE.NO_CHANGE : COMMIT_MODE.RELEASE;
//   var branchFound = false, ascentComplete = false;
// log(`has other view: ${hasOtherView}`);

//   // To avoid unnecessarily allocating new views during descent, and to avoid allocating an object or array to keep
//   // track of reusable view instances, we will temporarily repurpose the parent property of any reusable views in order
//   // build a makeshift stack.
//   var nextReusableView = View.none<T>();
//   var childView = view;

//   var xx = 0;
//   // Ascend to the closest ancestral node for which the specified ordinal index is a descendant.
//   do {
//     if(++xx === 10) {
//       throw new Error('Infinite loop (refocus view - ascend)');
//     }
//     // Changes to the child node will be applied to the parent node, including setting a placeholder slot for the child
//     // node if refocusing the view as a write target.
//     var parentView = ascend(state.group, childView, shift === 0, mode);
// publish(state, false, `[LOOP START | REFOCUS:ASCEND] child view: ${childView.id}, parentView: ${parentView.id}`);
// log(`parent view has id ${parentView.id}`);
//     if(asWriteTarget && !parentView.isEditable(state.group)) {
//       parentView = parentView.cloneToGroup(state.group);
//     }
// log(`parent view now has id ${parentView.id}`);

//     var childIsEditable = childView.isEditable(state.group);
//     var canReuseChildView = (!hasOtherView || (hasOtherView && isOtherViewUncommitted)) && childIsEditable;
// log(`child view ${childView.id} is ${canReuseChildView ? 'ELIGIBLE' : 'INVALID'} for reuse.`);

// //     var branchFoundThisIteration = false;
// //     if(!branchFound) {
// //       if(isViewInRange(parentView, ordinal, state.size)) {
// //         branchFound = true;
// //         branchFoundThisIteration = true;
// //         if(asWriteTarget && !parentView.isEditable(state.group)) {
// //           parentView
// //         }
// //       }
// //     }

//     // If the parent view is an ancestor of the other (left/right) view, and that view has uncommitted changes, they
//     // should also be propagated to the parent view to ensure that updated sizes and slot counts are correct before
//     // further operations targeting that node take place.
//     if(hasOtherView && isOtherViewUncommitted && tryCommitOtherView(state, otherView, childView.xparent, parentView, 0, COMMIT_MODE.NO_CHANGE)) {
// log(`other view is now committed`);
//       isOtherViewUncommitted = false;
//       if(!asWriteTarget) {
//         // If we're still ascending, we don't want to affect the reservation mode of the path from the shared branch
//         // node to the ancestral branch node from which we will ultimately descend to the desired ordinal position.
//         mode = COMMIT_MODE.NO_CHANGE;
//       }
//     }

//     // If the common upper branch from which we will descend to the new view has not yet been identified, we need to
//     // check if the new parent view is a range match, and if so, prepare to also reserve the rest of the upward path so
//     // that the final leaf node can be written to safely (assuming we've requested a write target).
//     if(!branchFound) {
// log(`check if view ${parentView.id} is in range for ordinal ${ordinal}; anchor: ${parentView.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'}, offset: ${parentView.offset}, slot size: ${parentView.slot.size}`, ordinal);
//       branchFound = isViewInRange(parentView, ordinal, state.size);
// log(`branch found: ${branchFound}`);
//       if(branchFound) {
//         view = parentView; // Capture this view as our descent root, in case further ascent is yet to occur
//         if(asWriteTarget) {
//           mode = COMMIT_MODE.RESERVE; // ... because we will continue to ascend if this slot is not reserved yet
//         }
//       }
//       if(canReuseChildView) {
// log(`child view ${childView.id} will be added to the reusable stack`, hasOtherView, isOtherViewUncommitted);
//         // The child view was created as part of the current batch of operations, so instead of discarding it, add it to
//         // the reusable view stack to avoid redundant allocations of new views during the descent.
//         childView.xparent = nextReusableView;
//         nextReusableView = childView;
//       }
//       // else if()
//       shift += CONST.BRANCH_INDEX_BITCOUNT;
//     }

//     if(!canReuseChildView && childIsEditable) {
//       childView.xparent = parentView;
// log(`child ${childView.id} now assigned to parent ${parentView.id}`);
//     }

//     // If the common upper branch node has been found but we want a write target, then we will continue the ascent until
//     // it is guaranteed that the current path has been reserved with placeholder slots all the way back to the root.
//     ascentComplete = branchFound && (!asWriteTarget || parentView.isRoot() || parentView.slot.isReserved());
// log(ascentComplete ? `ascent complete` : `ascent INCOMPLETE (branchFound: ${branchFound}, parent is root: ${parentView.isRoot()}, parent slot reserved: ${parentView.slot.isReserved()})`);
//     childView = parentView;

//   } while(!ascentComplete);
// publish(state, false, `[refocus] begin descent with initial offset ${view.offset}`);

//   var slot = view.slot;
//   if(asWriteTarget && !slot.isEditable(state.group)) {
//     view.slot = slot = view.isRoot() ? slot.cloneToGroup(state.group) : slot.toReservedNode(state.group);
//   }
//   var out = {slot, index: 0, offset: 0}; // TODO: reuse a preallocated object
//   var offset = view.offset;
// log(`offset of view ${view.id}: ${offset}`);
//   if(view.anchor !== OFFSET_ANCHOR.LEFT) {
//     offset = invertOffset(offset, slot.size, state.size);
// log(`captured offset inverted to: ${offset}`);
//   }

//   // Descend from the common ancestral branch node to the final node that owns the the destination ordinal position.
//   xx = 0;
//   do {
// log(`[LOOP START | REFOCUS:DESCEND | OFFSET: ${offset}] view: ${view.id}, parentView: ${parentView.id}, slot: ${slot.id}, ordinal: ${ordinal}`, slot);
//     if(!slot.resolveChild(ordinal, shift, out)) {
// log(`slot ${slot.id}`, slot);
//       debugger;
//       throw new Error(`No child found at ordinal ${ordinal}`);
//     }
//     if(out.slot.isReserved()) {
// publish(state, false, `child slot is reserved and cannot be traversed`);
//       // The descendant path is currently reserved by the other view, so we'll need to climb that view to get the child
//       // slot before we can continue from here.
//       shift = 0;
//       if(asWriteTarget && !otherView.isEditable(state.group)) {
//         state.setView(otherView = otherView.cloneToGroup(state.group));
//       }
//       childView = otherView;

//       do {
//         if(++xx === 10) {
//           throw new Error('Infinite loop (refocus view - ascend other view)');
//         }

//         view = ascend(state.group, childView, shift === 0, COMMIT_MODE.NO_CHANGE);
//         if(asWriteTarget && !view.isEditable(state.group)) {
//           view = view.cloneToGroup(state.group);
//           childView.xparent = view;
//         }
//         offset = view.offset;
//         shift += CONST.BRANCH_INDEX_BITCOUNT;
//         childView = view;
//       } while(!isViewInRange(view, ordinal, state.size));

//       if(view.anchor !== OFFSET_ANCHOR.LEFT) {
//         offset = invertOffset(offset, view.slot.size, state.size);
//       }

//       slot = view.slot;
//     }
//     else {
//       if(asWriteTarget) {
// log(`RESOLVED CHILD: slot id: ${out.slot.id}`);
//         // Now that we have the child slot, set the parent slot as a placeholder so that cheap changes can be made to
//         // descendant nodes in the future without having to rewrite the entire ancestral slot path, which would normally
//         // be required in order to avoid leaky references to obsolete nodes.
//         slot.slots[out.index] = out.slot.cloneAsPlaceholder(state.group);
//       }

//       // Each descendant view needs to record the absolute offset of the referenced slot in order to quickly judge whether
//       // or not that view's slot owns the subtree of a given ordinal that may be queried during future operations.
// log(`aggregated offset value was ${offset}, view.anchor: ${view.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'}, out.offset: ${out.offset}, out.slot.size: ${out.slot.size}, slot.size: ${slot.size}`);
//       offset += out.offset;
//       // offset += view.anchor === OFFSET_ANCHOR.LEFT ? out.offset : invertOffset(out.offset, out.slot.size, slot.size);
// log(`aggregated offset value updated to ${offset}`);
//       slot = out.slot;
// publish(state, false, '[refocus] mid descent');
//       if(asWriteTarget && !slot.isReservedFor(state.group)) {
// log(`slot ${slot.id} has wrong group ${slot.group} (should be ${state.group}) and will be cloned as a reserved node`);
//         slot = slot.toReservedNode(state.group);
// log(`slot id is now ${slot.id} with group ${slot.group}`);
//       }

//       // Reuse old views if possible during the descent, otherwise create new ones.
//       if(nextReusableView.isNone()) {
//         view = new View<T>(state.group, 0, anchor, out.index, 0, 0, view, slot);
// log(`make new view ${view.id} with parent ${view.xparent.id} and slot ${slot.id}, anchored ${nextReusableView.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} at offset ${offset}`);
//       }
//       else {
// log(`reuse view ${nextReusableView.id} with parent ${parentView.id} and slot ${slot.id}, anchored ${nextReusableView.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} at offset ${offset}`);
//         parentView = view;
//         view = nextReusableView;
//         nextReusableView = view.xparent;
//         view.xparent = parentView;
// log(`view ${view.id} anchor set ${anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'}`);
//         view.anchor = anchor;
//         view.slotIndex = out.index;
//         view.sizeDelta = 0;
//         view.slotsDelta = 0;
//         view.slot = slot;
//       }
// log(view.anchor, offset);
//       view.offset = view.anchor === OFFSET_ANCHOR.LEFT ? offset : invertOffset(offset, slot.size, state.size);

//       if(shift > 0) {
//         ordinal -= view.anchor === OFFSET_ANCHOR.LEFT ? view.offset : invertOffset(view.offset, view.slot.size, state.size);
//         // if(slot.recompute === -1) {
//         //   ordinal -= view.slotIndex << shift;
//         // }
//         // else {
//         //   ordinal -= slot.sum - slot.size;
//         // }
//   log(`ordinal reduced to ${ordinal} to cater for descent to slot index ${view.slotIndex}`);
//       }

//       shift -= CONST.BRANCH_INDEX_BITCOUNT;
//     }

//   } while(shift > 0);

// log(`set refocused view ${view.id} with anchor ${view.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'}`);
//   state.setView(view);

// log(`descent complete`);
//   return view;
// }

// export function focusOrdinal<T>(state: ListState<T>, ordinal: number, asWriteTarget: boolean): View<T>|undefined {
// log(`[focusOrdinal: ${ordinal}] state.size: ${state.size}`);
//   ordinal = normalizeIndex(state.size, ordinal);
//   if(ordinal === -1) {
//     return void 0;
//   }
//   var view = selectView(state, ordinal, asWriteTarget);
// // publish(state, true, `view selected prior to refocusing`);
//   return isViewInRange(view, ordinal, state.size) ? view
//     : refocusView(state, view, ordinal, asWriteTarget);
// }

// function focusEdge<T>(state: ListState<T>, asWriteTarget: boolean, edge: OFFSET_ANCHOR): View<T> {
//   var view = state.getView(edge, asWriteTarget);
// log(`view offset: ${view.offset}, write target: ${asWriteTarget}, slot reserved: ${view.slot.isReserved()}, root: ${view.isRoot()}`);
// if(asWriteTarget) publish(state, false, `edge focused as write target`);
//   return view.offset > 0 || (asWriteTarget && !view.slot.isReserved() && !view.isRoot())
//     ? refocusView(state, view, edge === OFFSET_ANCHOR.LEFT ? 0 : state.size - 1, asWriteTarget)
//     : view;
// }

// export function focusHead<T>(state: ListState<T>, asWriteTarget: boolean): View<T> {
// log(`[focusHead] state.size: ${state.size}`);
//   return focusEdge(state, asWriteTarget, OFFSET_ANCHOR.LEFT);
// }

// export function focusTail<T>(state: ListState<T>, asWriteTarget: boolean): View<T> {
// log(`[focusTail] state.size: ${state.size}`);
//   return focusEdge(state, asWriteTarget, OFFSET_ANCHOR.RIGHT);
// }

// export function focusView<T>(state: ListState<T>, ordinal: number, anchor: OFFSET_ANCHOR, asWriteTarget: boolean): View<T> {
//   var view = state.getView(anchor, true, ordinal);
//   if(!isViewInRange(view, ordinal, state.size)) {
//     view = refocusView(state, view, ordinal, true);
//   }
//   return view;
// }

export function getAtOrdinal<T>(state: ListState<T>, ordinal: number): T|undefined {
  var view = TreeWorker.focusOrdinal<T>(state, ordinal, false);
  if(view === void 0) return void 0;
  return <T>view.slot.slots[getLeafIndex(view, ordinal, state.size)];
}

export function getLeafIndex<T>(view: View<T>, ordinal: number, listSize: number): number {
  return ordinal - (view.anchor === OFFSET_ANCHOR.LEFT ? view.offset : invertOffset(view.offset, view.slot.size, listSize));
}