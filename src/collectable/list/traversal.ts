import {CONST, isDefined, isUndefined, invertOffset, min, max, normalizeIndex, shiftDownRoundUp, log, publish} from './common';

import {OFFSET_ANCHOR, View} from './view';
import {SLOT_STATUS, Slot, ExpansionState} from './slot';
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
function isViewInRange<T>(view: View<T>, ordinal: number, listSize: number): boolean {
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
                  : invertOffset(upperView.offset, upperView.slot.size, listSize);
log(`upperOffset (${upperOffset}) <= lowerView.offset (${lowerView.offset}) && upperOffset (${upperOffset}) + upperView.slot.size (${upperView.slot.size}) >= lowerView.offset (${lowerView.offset}) + lowerView.slot.size (${lowerView.slot.size})`);
  return upperOffset <= lowerView.offset && upperOffset + upperView.slot.size >= lowerView.offset + lowerView.slot.size;
}

/**
 * Commits changes to the child view to the parent view, then returns the parent view. If the parent is not of the
 * current group, it is first cloned before any changes are applied. If the supplied view is already the root view, a
 * new root is created with the supplied view's slot as the sole child slot. The returned parent view and slot will only
 * have been updated to the current group number if necessary, as per the value of the `status` argument.
 *
 * Note that this function does not mutate the child view or slot. If the child view is to be retained after this
 * operation, ensure it is of the correct group, then call {@link View#setCommitted}.
 *
 * @export
 * @template T The type of elements present in the list
 * @param {number} group The identifier for the current batch of operations
 * @param {View<T>} view The child view for which a parent is required
 * @param {SLOT_STATUS} status If SLOT_STATUS.RELEASE, and the parent currently uses a placeholder slot for the child,
 *     the child slot will be assigned back to the parent. If SLOT_STATUS.RESERVE, and no placeholder slot currently
 *     represents the child within its parent, the parent will be assigned a placeholder slot to represent the child
 *     before being returned.
 * @returns {View<T>} The parent view, with any size-related changes applied from the child to the parent view and/or slot.
 */
export function ascend<T>(group: number, childView: View<T>, status: SLOT_STATUS, expand?: ExpansionState): View<T> {
  var childSlot = childView.slot;

  if(childSlot.size === 0) {
    console.warn(`unhandled edge case warning: ascending from child slot that has no elements (group: ${childView.group}, slot index: ${childView.slotIndex})`);
  }

log(`[ASCEND] from view (${childView.id}), is root: ${childView.isRoot()}, has changed: ${childView.hasUncommittedChanges()}, status: ${status === SLOT_STATUS.NO_CHANGE ? 'NO CHANGE' : status === SLOT_STATUS.RELEASE ? 'RELEASE' : 'RESERVE'}, slot index: ${childView.slotIndex}` + (!expand ? '' : `, shift: ${expand.shift}`));
  // Ascending from the root slot effectively means growing the tree by one level.
  if(childView.isRoot()) {
    // Non-zero delta values for the child view can be disregarded, as we're absorbing the child view's final computed
    // values in advance.
    if(isDefined(expand)) {
      expand.next(1);
    }
    return new View<T>(group, childView.offset, childView.anchor, 0, 0, 0, View.none<T>(), childSlot.createParent(group, status, expand));
  }

  var hasChanges = childView.hasUncommittedChanges();
  var parentView = childView.parent;
  var parentSlot = parentView.slot;
log(`parent view has offset ${parentView.offset}, slots: ${parentSlot.slots.length}, changes;sizeDelta:`, hasChanges, childView.sizeDelta)

  // If the child wasn't already reserved with a placeholder slot, and no reservation has been requested, then there is
  // nothing further that we need to do.
  if(!hasChanges && isUndefined(expand) && status !== SLOT_STATUS.RESERVE && !childSlot.isReserved()) {
log(`clean parent retrieval with no modifications to the child`);
    return parentView;
  }

  var slotIndex = childView.slotIndex;
  if(hasChanges || status === SLOT_STATUS.RESERVE || isDefined(expand) || (childSlot.isReserved() && status === SLOT_STATUS.RELEASE)) {
    // Optional expansion parameters can add slots to the start or end of the parent slot.
    var prepend = 0, append = 0, extraSize = 0;
    if(isDefined(expand)) {
      expand.next(parentSlot.slots.length);
      extraSize = expand.addedSize;
      if(expand.prepend) {
        prepend = expand.addedSlots;
        slotIndex += prepend;
log(`slot index increased by ${prepend} to ${slotIndex}`);
      }
      else {
        append = expand.addedSlots;
      }
    }

    // Prepare the parent view and slot for modifications, and optionally append or prepend additional slots as needed.
    if(!parentSlot.isEditable(group)) {
log(`parent slot will be cloned from group ${parentSlot.group} to group ${group}`);
      // Note that it is impossible for a slot to be a member of the current group if the view referencing it is not.
      if(!parentView.isEditable(group)) {
        parentView = parentView.cloneToGroup(group);
      }
      parentSlot = extraSize > 0
        ? parentSlot.cloneWithAdjustedRange(group, prepend, append, false)
        : parentSlot.cloneToGroup(group);
      if(status === SLOT_STATUS.RESERVE || (status === SLOT_STATUS.NO_CHANGE && childSlot.isReserved())) {
        parentSlot.group = -group;
      }
      parentView.slot = parentSlot;
    }
    else if(extraSize > 0) {
      parentSlot.adjustRange(prepend, append, false);
    }
log(`parent view has offset ${parentView.offset}, has changes:`, hasChanges)
    // If the direction of expansion is the same as the current offset anchor, the offset anchor must be flipped so that
    // the relative offset is not invalidated by the expanded size of the slot.
    if(isDefined(expand)) {
      if((expand.prepend && parentView.anchor === OFFSET_ANCHOR.LEFT) || (!expand.prepend && parentView.anchor === OFFSET_ANCHOR.RIGHT)) {
log(`view ${parentView.id} anchor will be flipped to prevent offset invalidation resulting from slot expansion`);
        parentView.flipAnchor((<ExpansionState>expand).totalSize - childView.sizeDelta);
      }
      parentSlot.size += extraSize;
      if(!parentView.isRoot()) {
        parentView.sizeDelta += expand.addedSize;
      }
log(`due to expansion, parent slot size increased to ${parentSlot.size}, size delta changed to ${parentView.sizeDelta}`);
    }
log(`parent view has offset ${parentView.offset}`, hasChanges)
    // Pending changes to the list size and parent slot subcount need to be propagated upwards. Before any further
    // operations are performed, the calling function should also commit changes from the other (left/right) view if
    // they descend from this branch, or the returned slot/view may not reflect the true state of the list.
    if(hasChanges) {
      if(!parentView.isRoot()) {
        parentView.sizeDelta += childView.sizeDelta;
      }
      parentSlot.subcount += childView.slotsDelta;
      parentSlot.size += childView.sizeDelta;
log(`due to uncommitted changes from child view ${childView.id}, parent slot size increased by ${childView.sizeDelta} to ${parentSlot.size}, size delta is now ${parentView.sizeDelta}`);

      // If the child or parent is a relaxed slot, set the recompute count to ensure that accumulated sums are updated
      // before any further descent from the parent slot takes place.
      if(parentSlot.isRelaxed() || childSlot.isRelaxed()) {
        parentSlot.recompute = parentSlot.isRelaxed()
          ? max(parentSlot.recompute, parentSlot.slots.length - slotIndex)
          : parentSlot.slots.length;
      }
      else {
        parentSlot.recompute = -1;
      }
      // Avoid dragging around extraneous references to old state that will be invalidated by any subsequent writes to
      // descendant nodes.
log(`status: ${status}, has changes: ${hasChanges}, child slot reserved: ${childSlot.isReserved()}`, childSlot);
      if(status === SLOT_STATUS.RESERVE || (hasChanges && childSlot.isReserved())) {
        var oldChildSlot = <Slot<T>>parentSlot.slots[slotIndex];
        if(oldChildSlot.isReservedFor(group)) {
          oldChildSlot.updatePlaceholder(childSlot);
        }
        else {
          parentSlot.slots[slotIndex] = childSlot.cloneAsPlaceholder(group);
        }
      }
    }
    // Kill off any obsolete placeholder slots that are no longer needed.
    if(status === SLOT_STATUS.RELEASE) {
      if(childSlot.isReserved()) {
        if(childSlot.isReservedFor(group)) {
          childSlot.group = group;
        }
        else {
          childSlot = childSlot.cloneToGroup(group);
        }
        childSlot.sum = (<Slot<T>>parentSlot.slots[slotIndex]).sum;
      }
      parentSlot.slots[slotIndex] = childSlot;
    }
  }

  return parentView;
}

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
export function tryCommitOtherView<T>(state: ListState<T>, otherView: View<T>, expectedParent: View<T>, replacementParent: View<T>, slotIndexOffset: number): View<T>|undefined {
log(`try commit other view (state group: ${state.group}, state size: ${state.size}, other view group: ${otherView.group}, expected parent: ${expectedParent.id}, replacement parent: ${replacementParent.id}), slot index offset: ${slotIndexOffset}`)
log(`expected parent:`, expectedParent);
log(`replacement parent:`, replacementParent);
  if(!isAncestor(replacementParent, otherView, state.size)) {
log(`not an ancestor. commit will be skipped.`);
    return void 0;
  }
log(`----- BEGIN COMMIT OTHER VIEW -----`);
log(`other view (${otherView.id}) is a descendant of upper view ${expectedParent.id}`);

  if(!otherView.isEditable(state.group)) {
    otherView = otherView.cloneToGroup(state.group);
    state.setView(otherView);
log(`other view updated to group ${state.group}`);
  }

  var xx = 0;
  while(otherView.parent !== expectedParent) {
    if(++xx === 10) {
      throw new Error('Infinite loop (try commit other)');
    }
    var otherParent = ascend(state.group, otherView, SLOT_STATUS.NO_CHANGE);
    if(!otherParent.isEditable(state.group)) {
      otherParent = otherParent.cloneToGroup(state.group);
    }
    otherView.setCommitted(otherParent);
    otherView = otherParent;
log(`other view ascending to find common parent`);
  }

log(`updating other view to point at replacement parent ${replacementParent.id} instead of ${expectedParent.id}`);
  otherView.parent = replacementParent;
  otherView.slotIndex += slotIndexOffset;
  ascend(state.group, otherView, SLOT_STATUS.NO_CHANGE);
  otherView.setCommitted();

log(`----- END COMMIT OTHER VIEW -----`);
  return otherView;
}

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
export function refocusView<T>(state: ListState<T>, view: View<T>, ordinal: number, asWriteTarget: boolean, preserveStatus: boolean = false): View<T> {
  ordinal = normalizeIndex(state.size, ordinal);
log(`[refocusView] refocusing view ${view.id} to ordinal ${ordinal} (as write target: ${asWriteTarget})`);
  var shift = 0;
  var anchor = view.anchor;
  var otherView = state.getOtherView(anchor);
  var hasOtherView = !otherView.isNone(), isOtherViewUncommitted = true;
  var status = preserveStatus ? SLOT_STATUS.NO_CHANGE : SLOT_STATUS.RELEASE;
  var branchFound = false, ascentComplete = false;
log(`has other view: ${hasOtherView}`);

  // To avoid unnecessarily allocating new views during descent, and to avoid allocating an object or array to keep
  // track of reusable view instances, we will temporarily repurpose the parent property of any reusable views in order
  // build a makeshift stack.
  var nextReusableView = View.none<T>();
  var childView = view;

  var xx = 0;
  // Ascend to the closest ancestral node for which the specified ordinal index is a descendant.
  do {
    if(++xx === 10) {
      throw new Error('Infinite loop (refocus view)');
    }
    // Changes to the child node will be applied to the parent node, including setting a placeholder slot for the child
    // node if refocusing the view as a write target.
    var parentView = ascend(state.group, childView, status);
log(`[LOOP START | REFOCUS:ASCEND] child view: ${childView.id}, parentView: ${parentView.id}`);
log(`parent view has id ${parentView.id}`);
    if(asWriteTarget && !parentView.isEditable(state.group)) {
      parentView = parentView.cloneToGroup(state.group);
    }
log(`parent view now has id ${parentView.id}`);

    var childIsEditable = childView.isEditable(state.group);
    var canReuseChildView = (!hasOtherView || (hasOtherView && isOtherViewUncommitted)) && childIsEditable;
log(`child view ${childView.id} is ${canReuseChildView ? 'ELIGIBLE' : 'INVALID'} for reuse.`);

//     var branchFoundThisIteration = false;
//     if(!branchFound) {
log('branch found');
//       if(isViewInRange(parentView, ordinal, state.size)) {
//         branchFound = true;
//         branchFoundThisIteration = true;
//         if(asWriteTarget && !parentView.isEditable(state.group)) {
//           parentView
//         }
//       }
//     }

    // If the parent view is an ancestor of the other (left/right) view, and that view has uncommitted changes, they
    // should also be propagated to the parent view to ensure that updated sizes and slot counts are correct before
    // further operations targeting that node take place.
    if(hasOtherView && isOtherViewUncommitted && tryCommitOtherView(state, otherView, childView.parent, parentView, 0)) {
log(`other view is now committed`);
      isOtherViewUncommitted = false;
      if(!asWriteTarget) {
        // If we're still ascending, we don't want to affect the reservation status of the path from the shared branch
        // node to the ancestral branch node from which we will ultimately descend to the desired ordinal position.
        status = SLOT_STATUS.NO_CHANGE;
      }
    }

    // If the common upper branch from which we will descend to the new view has not yet been identified, we need to
    // check if the new parent view is a range match, and if so, prepare to also reserve the rest of the upward path so
    // that the final leaf node can be written to safely (assuming we've requested a write target).
    if(!branchFound) {
      branchFound = isViewInRange(parentView, ordinal, state.size);
      if(branchFound) {
        view = parentView; // Capture this view as our descent root, in case further ascent is yet to occur
        if(asWriteTarget) {
          status = SLOT_STATUS.RESERVE; // ... because we will continue to ascend if this slot is not reserved yet
        }
      }
      if(canReuseChildView) {
log(`child view ${childView.id} will be added to the reusable stack`, hasOtherView, isOtherViewUncommitted);
        // The child view was created as part of the current batch of operations, so instead of discarding it, add it to
        // the reusable view stack to avoid redundant allocations of new views during the descent.
        childView.parent = nextReusableView;
        nextReusableView = childView;
      }
      // else if()
      shift += CONST.BRANCH_INDEX_BITCOUNT;
    }

    if(!canReuseChildView && childIsEditable) {
      childView.parent = parentView;
log(`child ${childView.id} now assigned to parent ${parentView.id}`);
    }

    // If the common upper branch node has been found but we want a write target, then we will continue the ascent until
    // it is guaranteed that the current path has been reserved with placeholder slots all the way back to the root.
    ascentComplete = branchFound && (!asWriteTarget || parentView.isRoot() || parentView.slot.isReserved());
    childView = parentView;

  } while(!ascentComplete);
publish(state, false, `[refocus] begin descent with initial offset ${view.offset}`);

  var slot = view.slot;
  if(asWriteTarget && !view.slot.isEditable(state.group)) {
    view.slot = slot = slot.cloneAsReservedNode(state.group);
  }
  var out = {slot, index: 0, offset: 0}; // TODO: reuse a preallocated object
  var offset = view.offset;
  // Descend from the common ancestral branch node to the final node that owns the the destination ordinal position.
  do {
log(`[LOOP START | REFOCUS:DESCEND] view: ${view.id}, parentView: ${parentView.id}, slot: ${slot.id}`, slot);
    if(!slot.resolveChild(ordinal, shift, out)) {
log(`slot ${slot.id}`, slot);
      throw new Error(`No child found at ordinal ${ordinal}`);
    }
log(`RESOLVED CHILD: slot id: ${out.slot.id}`);
    if(asWriteTarget) {
      // Now that we have the child slot, set the parent slot as a placeholder so that cheap changes can be made to
      // descendant nodes in the future without having to rewrite the entire ancestral slot path, which would normally
      // be required in order to avoid leaky references to obsolete nodes.
      slot.slots[out.index] = out.slot.cloneAsPlaceholder(state.group);
    }

    // Each descendant view needs to record the absolute offset of the referenced slot in order to quickly judge whether
    // or not that view's slot owns the subtree of a given ordinal that may be queried during future operations.
log(`aggregated offset value was ${offset}, view.anchor: ${view.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'}, out.offset: ${out.offset}, out.slot.size: ${out.slot.size}, slot.size: ${slot.size}`);
    offset += out.offset;
    // offset += view.anchor === OFFSET_ANCHOR.LEFT ? out.offset : invertOffset(out.offset, out.slot.size, slot.size);
log(`aggregated offset value updated to ${offset}`);
    slot = out.slot;
publish(state, false, '[refocus] mid descent')
    if(!slot.isReservedFor(state.group)) {
log(`slot ${slot.id} has wrong group ${slot.group} and will be cloned as a reserved node`);
      slot = slot.cloneAsReservedNode(state.group);
log(`slot id is now ${slot.id} with group ${slot.group}`);
    }

    // Reuse old views if possible during the descent, otherwise create new ones.
    if(nextReusableView.isNone()) {
      view = new View<T>(state.group, 0, anchor, out.index, 0, 0, view, slot);
log(`make new view ${view.id} with parent ${view.parent.id} and slot ${slot.id}, anchored ${nextReusableView.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} at offset ${offset}`);
    }
    else {
log(`reuse view ${nextReusableView.id} with parent ${parentView.id} and slot ${slot.id}, anchored ${nextReusableView.anchor === OFFSET_ANCHOR.LEFT ? 'LEFT' : 'RIGHT'} at offset ${offset}`);
      parentView = view;
      view = nextReusableView;
      nextReusableView = view.parent;
      view.parent = parentView;
      view.anchor = anchor;
      view.slotIndex = out.index;
      view.sizeDelta = 0;
      view.slotsDelta = 0;
      view.slot = slot;
    }
    view.offset = view.anchor === OFFSET_ANCHOR.LEFT ? offset : invertOffset(offset, slot.size, state.size);

    if(shift > 0) {
      if(slot.recompute === -1) {
        ordinal -= view.slotIndex << shift;
      }
      else {
        ordinal -= slot.sum - slot.size;
      }
log(`ordinal reduced to ${ordinal} to cater for descent to slot index ${view.slotIndex}`);
    }

    shift -= CONST.BRANCH_INDEX_BITCOUNT;

  } while(shift > 0);

log(`set refocused view ${view.id} with anchor ${view.anchor}`)
  state.setView(view);

log(`descent complete`)
  return view;
}

export function focusOrdinal<T>(state: ListState<T>, ordinal: number, asWriteTarget: boolean): View<T>|undefined {
  ordinal = normalizeIndex(state.size, ordinal);
  if(ordinal === -1) {
    return void 0;
  }
  var view = state.selectView(ordinal, asWriteTarget);
  return isViewInRange(view, ordinal, state.size) ? view
    : refocusView(state, view, ordinal, asWriteTarget);
}

function focusEdge<T>(state: ListState<T>, isWriteTarget: boolean, edge: OFFSET_ANCHOR): View<T> {
  var view = state.getView(edge, isWriteTarget);
log(`view offset: ${view.offset}, write target: ${isWriteTarget}, slot reserved: ${view.slot.isReserved()}, root: ${view.isRoot()}`);
// if(isWriteTarget) publish(state, false, `edge focused as write target`)
  return view.offset > 0 || (isWriteTarget && !view.slot.isReserved() && !view.isRoot())
    ? refocusView(state, view, edge === OFFSET_ANCHOR.LEFT ? 0 : state.size - 1, isWriteTarget)
    : view;
}

export function focusHead<T>(state: ListState<T>, isWriteTarget: boolean): View<T> {
  return focusEdge(state, isWriteTarget, OFFSET_ANCHOR.LEFT);
}

export function focusTail<T>(state: ListState<T>, isWriteTarget: boolean): View<T> {
  return focusEdge(state, isWriteTarget, OFFSET_ANCHOR.RIGHT);
}

export function getAtOrdinal<T>(state: ListState<T>, ordinal: number): T|undefined {
  // TODO: move into List<T>, seeing as MutableList<T> will be removed
  var view = focusOrdinal(state, ordinal, false);
  if(view === void 0) return void 0;
  return <T>view.slot.slots[ordinal - view.offset];
}