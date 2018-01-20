import { isDefined, isUndefined, max } from '@collectable/core';
import { COMMIT_MODE, CONST, OFFSET_ANCHOR, invertAnchor, invertOffset, normalizeIndex, verifyIndex } from './common';
import { View } from './view';
import { ExpansionParameters, Slot } from './slot';
import { ListStructure, createList, getOtherView, getView, setView } from './list';

/**
 * Checks whether a list ordinal position lies within the absolute range of a slot within the list
 *
 * @param {number} ordinal
 * @param {number} leftOffset
 * @param {number} slotSize
 * @returns {boolean}
 */
function isInRange (ordinal: number, leftOffset: number, slotSize: number): boolean {
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
export function isViewInRange<T> (view: View<T>, ordinal: number, listSize: number): boolean {
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
function isAncestor<T> (upperView: View<T>, lowerView: View<T>, listSize: number): boolean {
  if(upperView.isRoot()) return true;
  var upperOffset = lowerView.anchor === upperView.anchor ? upperView.offset
                  : invertOffset(upperView.offset, upperView.slot.size + lowerView.sizeDelta, listSize);
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
function selectView<T> (list: ListStructure<T>, ordinal: number, asWriteTarget: boolean): View<T> {
  var left = list._left, right = list._right, resolve = asWriteTarget;
  var anchor: OFFSET_ANCHOR;
  if(left.isNone()) {
    anchor = right.isRoot() || isInRange(ordinal, invertOffset(right.offset, right.slot.size, list._size), right.slot.size)
      ? OFFSET_ANCHOR.RIGHT : OFFSET_ANCHOR.LEFT;
    if(anchor === OFFSET_ANCHOR.LEFT) resolve = true;
  }
  else if(right.isNone()) {
    anchor = left.isRoot() || isInRange(ordinal, left.offset, left.slot.size)
      ? OFFSET_ANCHOR.LEFT : OFFSET_ANCHOR.RIGHT;
    if(anchor === OFFSET_ANCHOR.RIGHT) resolve = true;
  }
  else {
    var leftEnd = left.bound();
    var rightStart = list._size - right.bound();
    anchor = rightStart <= ordinal ? OFFSET_ANCHOR.RIGHT
      : leftEnd > ordinal ? OFFSET_ANCHOR.LEFT
      : invertAnchor(list._lastWrite);
  }
  return resolve
    ? getView(list, anchor, asWriteTarget, ordinal)
    : anchor === OFFSET_ANCHOR.LEFT ? left : right;
}

export class TreeWorker<T> {
  private static _defaults: {
    defaultPrimary: TreeWorker<any>;
    defaultSecondary: TreeWorker<any>;
    defaultOther: TreeWorker<any>;
    defaultTemporary: TreeWorker<any>;
  };

  private static _getDefaults () {
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

  static defaultPrimary<T> (): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultPrimary;
  }

  static defaultSecondary<T> (): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultSecondary;
  }

  static defaultOther<T> (): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultOther;
  }

  static defaultTemporary<T> (): TreeWorker<T> {
    return TreeWorker._getDefaults().defaultTemporary;
  }

  static refocusView<T> (list: ListStructure<T>, view: View<T>, ordinal: number, asAltView: boolean, asWriteTarget: boolean) {
    var worker = TreeWorker.defaultTemporary<T>().reset(list, view, list._group);
    view = worker.refocusView(ordinal, asAltView, asWriteTarget);
    worker.dispose();
    return view;
  }

  static focusOrdinal<T> (list: ListStructure<T>, ordinal: number, asWriteTarget: boolean): View<T>|undefined {
    ordinal = verifyIndex(list._size, ordinal);
    if(ordinal === -1) return void 0;
    var view = selectView(list, ordinal, asWriteTarget);
    return isViewInRange(view, ordinal, list._size) ? view
      : TreeWorker.refocusView<T>(list, view, ordinal, false, asWriteTarget);
  }

  static focusEdge<T> (list: ListStructure<T>, edge: OFFSET_ANCHOR, asWriteTarget: boolean): View<T> {
    var view = getView(list, edge, asWriteTarget);
    view = view.offset > 0 || (asWriteTarget && !view.slot.isReserved() && !view.isRoot())
      ? TreeWorker.refocusView<T>(list, view, edge === OFFSET_ANCHOR.LEFT ? 0 : list._size - 1, false, asWriteTarget)
      : view;
    return view;
  }

  static focusHead<T> (list: ListStructure<T>, asWriteTarget: boolean): View<T> {
    return TreeWorker.focusEdge(list, OFFSET_ANCHOR.LEFT, asWriteTarget);
  }

  static focusTail<T> (list: ListStructure<T>, asWriteTarget: boolean): View<T> {
    return TreeWorker.focusEdge(list, OFFSET_ANCHOR.RIGHT, asWriteTarget);
  }

  static focusView<T> (list: ListStructure<T>, ordinal: number, anchor: OFFSET_ANCHOR, asWriteTarget: boolean): View<T> {
    var view = getView(list, anchor, true, ordinal);
    return isViewInRange(view, ordinal, list._size) ? view
      : TreeWorker.refocusView<T>(list, view, ordinal, false, true);
  }

  list = createList<T>(false);
  previous = View.none<T>();
  current = View.none<T>();
  other = View.none<T>();
  otherCommittedChild = View.none<T>();
  otherCommitMode: COMMIT_MODE = -1;
  committedOther = false;
  slotResult = { slot: Slot.empty<T>(), index: 0, offset: 0 };
  group = 0;
  shift = 0;

  isRoot (): boolean {
    return this.current.isRoot();
  }

  hasOtherView (): boolean {
    return !this.other.isNone();
  }

  reset (list: ListStructure<T>, view: View<T>, group: number, otherCommitMode?: COMMIT_MODE): TreeWorker<T> {
    if (isUndefined(otherCommitMode)) {
      otherCommitMode = COMMIT_MODE.NO_CHANGE;
    }
    this.list = list;
    this.current = view;
    this.group = group;
    this.shift = 0;
    if(otherCommitMode === -1) {
      this.committedOther = true;
    }
    else {
      this.other = getOtherView(list, view.anchor);
      this.committedOther = this.other.isNone();
      this.otherCommitMode = otherCommitMode;
    }
    return this;
  }

  dispose (): void {
    this.list = createList<T>(false);
    this.previous = View.none<T>();
    this.current = View.none<T>();
    this.other = View.none<T>();
    this.otherCommittedChild = View.none<T>();
    this.slotResult.slot = Slot.empty<T>();
  }

  ensureEditable (persist: boolean): View<T> {
    var view = this.current;
    var group = this.list._group;
    if(!view.isEditable(group)) {
      this.current = view = view.cloneToGroup(group);
      if(this.shift === 0 && persist) {
        setView(this.list, view);
      }
    }
    return view;
  }

  ascend (mode: COMMIT_MODE, expandParent?: ExpansionParameters): View<T> {
    var childView = this.current;
    var childSlot = childView.slot;
    var group = this.group;
    var parentView: View<T>;
    var parentSlot: Slot<T>;
    var hasChanges: boolean;
    var prepend = 0, append = 0;


    if(this.committedOther && !this.otherCommittedChild.isNone()) {
      this.otherCommittedChild = View.none<T>();
    }

    var persistChild = mode === COMMIT_MODE.RELEASE_DISCARD
      ? (mode = COMMIT_MODE.RELEASE, false/*this.hasOtherView() && this.other.parent === childView*/)
      : true;
    var slotIndex = childView.slotIndex;
    var childWasRoot = childView.isRoot();

    if(childWasRoot) {
      if(this.shift >= CONST.BRANCH_INDEX_BITCOUNT*12) {
        throw new Error('Unterminated tree growth');
      }

      // Ascending from the root slot causes the tree to grow by one level. Non-zero delta values for the child view can
      // be disregarded, as we're absorbing the child view's final computed values in advance.
      var slotCount = 1, slotSize = childSlot.size;
      var recompute = childSlot.isRelaxed() ? slotCount : -1;
      if(isDefined(expandParent)) {
        prepend = expandParent.padLeft;
        append = expandParent.padRight;

        if(childView.isAnchoredIncorrectly(prepend) && (childView = this.ensureEditable(persistChild))) {
          childView.flipAnchor(this.list._size);
        }

        slotCount += prepend + append;
        slotIndex += prepend;
        slotSize += expandParent.sizeDelta;
        if(recompute !== -1) {
          recompute += max(append, -1);
        }
        this.list._size += expandParent.sizeDelta;
      }
      var slots = new Array<Slot<T>>(slotCount);
      slots[slotIndex] = mode === COMMIT_MODE.RESERVE ? childSlot.cloneAsPlaceholder(group) : childSlot;
      parentSlot = new Slot<T>(group, slotSize, 0, recompute, childSlot.slots.length, slots);
      parentView = View.create<T>(group, childView.offset, prepend ? OFFSET_ANCHOR.RIGHT : OFFSET_ANCHOR.LEFT, 0, 0, 0, View.none<T>(), parentSlot);
      hasChanges = false;
    }
    else {

      parentView = childView.parent.ensureEditable(group);
      parentSlot = parentView.slot;
      hasChanges = childView.hasUncommittedChanges();

      // If the child wasn't already reserved with a placeholder slot, and no reservation has been requested, then there is
      // nothing further that we need to do.
      if(hasChanges || mode === COMMIT_MODE.RESERVE || isDefined(expandParent)) {
        // Optional expansion parameters can add slots to the start or end of the parent slot.
        if(isDefined(expandParent)) {
          append = expandParent.padRight;
          prepend = expandParent.padLeft;
          slotIndex += prepend;
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

        if(isDefined(expandParent)) {
          this.list._size += expandParent.sizeDelta;
        }

        if(!this.committedOther && isAncestor(parentView, this.other, this.list._size)) {
          this.commitOther(parentView, prepend);
        }

        // If the direction of expansion is the same as the current offset anchor, the offset anchor must be flipped so that
        // the relative offset is not invalidated by the expanded size of the slot. If expanding both sides, offset
        // adjustments will need to be calculated externally.
        if(isDefined(expandParent)) {
          parentSlot.size += expandParent.sizeDelta;
          if(!parentView.isRoot()) {
            parentView.sizeDelta += expandParent.sizeDelta;
          }
        }

        // Pending changes to the list size and parent slot subcount need to be propagated upwards. Before any further
        // operations are performed, the calling function should also commit changes from the other (left/right) view if
        // they descend from this branch, or the returned slot/view may not reflect the true state of the list.
        if(hasChanges) {
          if(!parentView.isRoot()) {
            parentView.sizeDelta += childView.sizeDelta;
          }
          parentSlot.subcount += childView.slotsDelta;
          parentSlot.size += childView.sizeDelta;

          if(parentSlot.isRelaxed() || childSlot.isRelaxed() || (childView.slotsDelta < 0 && slotIndex < parentSlot.slots.length - 1 && parentSlot.recompute === -1)) {
            parentSlot.recompute = max(parentSlot.recompute, parentSlot.slots.length - slotIndex);
          }
          else {
            parentSlot.recompute = -1;
          }
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
          if(!parentSlot.isEditable(group)) {
            parentView.slot = parentSlot = parentSlot.cloneToGroup(group, true);
          }
          if(childSlot.isEditable(group)) {
            childSlot.group = group;
          }
          else {
            childSlot = childSlot.cloneToGroup(group);
          }
          childSlot.sum = (<Slot<T>>parentSlot.slots[slotIndex]).sum;
          parentSlot.slots[slotIndex] = childSlot;
        }
      }
    }

    // If the slot is flagged as relaxed, but it is now full, change it back to a regular node.
    if(parentSlot.recompute !== -1 && parentSlot.size === CONST.BRANCH_FACTOR << (this.shift + CONST.BRANCH_INDEX_BITCOUNT)) {
      parentSlot.recompute = -1;
    }

    if(!this.committedOther && isAncestor(parentView, this.other, this.list._size)) {
      this.commitOther(parentView, isDefined(expandParent) ? expandParent.padLeft : 0);
    }

    if(persistChild) {
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
          setView(this.list, childView);
        }
      }


      if(hasChanges || childSlot !== childView.slot || childView.parent !== parentView || this.otherCommitMode === -1) {
        childView.slot = childSlot;
        childView.parent = parentView;
        childView.slotsDelta = 0;
        childView.sizeDelta = 0;
      }
      childView.slotIndex = slotIndex;
      this.previous = childView;
    }
    else if(childView.isEditable(group)) {
      View.pushReusableView(childView);
    }

    this.current = parentView;
    this.shift += CONST.BRANCH_INDEX_BITCOUNT;

    return parentView;
  }

  commitOther (replacementParent: View<T>, slotIndexOffset: number): void {
    var otherView = this.other;
    if(slotIndexOffset === 0
      && this.shift === 0
      && !otherView.hasUncommittedChanges()
      && otherView.parent === replacementParent
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
    setView(this.list, this.other = this.otherCommitMode === COMMIT_MODE.RELEASE_DISCARD ? View.empty<T>(anchor) : otherView);
    var worker = TreeWorker.defaultOther<T>().reset(this.list, otherView, this.group, -1);

    while(worker.shift < this.shift) {
      otherView = worker.ascend(this.otherCommitMode);
    }

    otherView.parent = replacementParent;
    otherView.slotIndex += slotIndexOffset;
    worker.ascend(this.otherCommitMode);
    this.committedOther = true;
    this.otherCommittedChild = worker.previous;
    worker.dispose();
  }

  ascendToOrdinal (ordinal: number, mode: COMMIT_MODE, ensureBranchReserved: boolean): View<T> {
    var view = this.current, target = view, branchFound = false;
    var shift = this.shift;

    do {
      view = this.ascend(!this.hasOtherView() || (this.hasOtherView() && !this.committedOther) || mode === COMMIT_MODE.RESERVE ? mode : COMMIT_MODE.NO_CHANGE);
      if(!branchFound) {
        branchFound = isViewInRange(view, ordinal, this.list._size);
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
    return target;
  }

  descendToOrdinal (ordinal: number, asWriteTarget: boolean): View<T>|undefined {
    var view = this.current, shift = this.shift, out = this.slotResult;
    var offset = view.anchor === OFFSET_ANCHOR.RIGHT ? invertOffset(view.offset, view.slot.size, this.list._size) : view.offset;
    var flip = this.hasOtherView() && this.other.anchor === OFFSET_ANCHOR.LEFT;
    do {
      view.slot.resolveChild(ordinal - offset, shift, out);
      if(out.slot.isReserved()) {
        while(view !== this.current) {
          var discarded = view;
          view = discarded.parent;
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
      if(flip) view.flipAnchor(this.list._size);
    } while(shift > 0);

    this.previous = this.current;
    this.current = view;
    this.shift = 0;

    return view;
  }

  refocusView (ordinal: number, asAltView: boolean, asWriteTarget: boolean): View<T> {
    ordinal = verifyIndex(this.list._size, ordinal);
    var anchor = asAltView ? invertAnchor(this.current.anchor) : this.current.anchor;
    this.ascendToOrdinal(ordinal, asAltView ? COMMIT_MODE.NO_CHANGE : COMMIT_MODE.RELEASE_DISCARD, asWriteTarget);
    var view = this.descendToOrdinal(ordinal, asWriteTarget);

    if(isUndefined(view)) {
      this.reset(this.list, getOtherView(this.list, anchor), this.group, -1);
      this.ascendToOrdinal(ordinal, COMMIT_MODE.NO_CHANGE, false);
      view = <View<T>>this.descendToOrdinal(ordinal, asWriteTarget);
    }
    if(view.anchor !== anchor) {
      view.flipAnchor(this.list._size);
    }
    setView(this.list, view);
    return view;
  }
}

export function getAtOrdinal<T> (list: ListStructure<T>, ordinal: number): T|undefined {
  ordinal = normalizeIndex(list._size, ordinal);
  var view = TreeWorker.focusOrdinal<T>(list, ordinal, false);
  if(view === void 0) return void 0;
  return <T>view.slot.slots[getLeafIndex(view, ordinal, list._size)];
}

export function getLeafIndex<T> (view: View<T>, ordinal: number, listSize: number): number {
  return ordinal - (view.anchor === OFFSET_ANCHOR.LEFT ? view.offset : invertOffset(view.offset, view.slot.size, listSize));
}