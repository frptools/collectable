import {CONST, isDefined, min, max, normalizeIndex, shiftDownRoundUp} from './common';

import {OFFSET_ANCHOR, View, voidView} from './view';
import {SLOT_STATUS, Slot} from './slot';
import {ListState} from './state';

/**
 * Flips an inward-facing offset value so that it is equal to the distance from the other end of the list to the
 * opposite bound of a given slot
 * 
 * @param {number} offset The original internal offset value, relative to one end of the list
 * @param {number} slotSize The size of the slot that the offset is relative to
 * @param {number} listSize The size of the list
 * @returns {number} The inverted offset value
 */
function invertOffset(offset: number, slotSize: number, listSize: number): number {
  return listSize - offset - slotSize;
}

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
  var upperOffset = lowerView.anchor === upperView.anchor ? upperView.offset
                  : invertOffset(upperView.offset, upperView.slot.size, listSize);
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
export function ascend<T>(group: number, childView: View<T>, status: SLOT_STATUS, expand?: {size: number, shift: number, prepend: boolean, added: number}): View<T> {
  var childSlot = childView.slot;

  // Ascending from the root slot effectively means growing the tree by one level.
  if(childView.isRoot()) {
    // Non-zero delta values for the child view can be disregarded, as we're absorbing the child view's final computed
    // values in advance.
    return new View<T>(group, childView.offset, childView.anchor, childSlot.sum, 0, 0, voidView, parentSlot = childSlot.createParent(group, status));
  }

  var parentView = childView.parent;
  var parentSlot = parentView.slot;

  // If the child wasn't already reserved with a placeholder slot, and no reservation has been requested, then there is
  // nothing further that we need to do.
  var isChildReserved = childSlot.isReserved();
  if(!isChildReserved && status !== SLOT_STATUS.RESERVE) {
    return parentView;
  }

  var hasChanges = childView.hasUncommittedChanges();
  if(hasChanges || status === SLOT_STATUS.RELEASE) {

    // Optional expansion parameters can add slots to the start or end of the parent slot.
    var prepend = 0, append = 0, extraSize = 0;
    if(isDefined(expand)) {
      append = parentSlot.calculateSlotsToAdd(shiftDownRoundUp(expand.size, expand.size));
      extraSize = min(expand.size, append << expand.shift);
      // Update/set out parameters for use at the call site.
      expand.size -= extraSize; // Successive calls will reuse the same object until size reaches zero.
      expand.added = append; // The call site will want to know how many slots were added.
      if(expand.prepend) {
        prepend = append;
        append = 0;
      }
    }

    // Prepare the parent view and slot for modifications, and optionally append or prepend additional slots as needed.
    if(!parentSlot.isEditable(group)) {
      // Note that it is impossible for a slot to be a member of the current group if the view referencing it is not.
      if(!parentView.isEditable(group)) {
        parentView = parentView.cloneToGroup(group);
      }
      parentSlot = prepend > 0 || append > 0
        ? parentSlot.cloneWithAdjustedRange(group, prepend, append, false)
        : parentSlot.cloneToGroup(group);
      parentView.slot = parentSlot;
    }
    else if(prepend > 0 || append > 0) {
      parentSlot.adjustRange(prepend, append, false);
    }
    parentSlot.size += extraSize;

    // Pending changes to the list size and parent slot subcount need to be propagated upwards. Before any further
    // operations are performed, the calling function should also commit changes from the other (left/right) view if
    // they descend from this branch, or the returned slot/view may not reflect the true state of the list.
    if(hasChanges) {
      parentView.sizeDelta += childView.sizeDelta;
      parentSlot.subcount += childView.slotsDelta;
      parentSlot.size += childView.sizeDelta;

      // If the child or parent is a relaxed slot, set the recompute count to ensure that accumulated sums are updated
      // before any further descent from the parent slot takes place.
      if(parentSlot.isRelaxed() || childSlot.isRelaxed()) {
        parentSlot.recompute = parentSlot.isRelaxed()
          ? max(parentSlot.recompute, parentSlot.slots.length - childView.slotIndex)
          : parentSlot.slots.length;
      }
      else {
        parentSlot.recompute = -1;
      }

      // Avoid dragging around extraneous references to old state that will be invalidated by any subsequent writes to
      // descendant nodes.
      if(status === SLOT_STATUS.RESERVE) {
        var oldChildSlot = <Slot<T>>parentSlot.slots[childView.slotIndex];
        if(oldChildSlot.isReservedFor(group)) {
          oldChildSlot.updatePlaceholder(childSlot);
        }
        else {
          parentSlot.slots[childView.slotIndex] = childSlot.cloneAsPlaceholder(group);
        }
      }
    }

    // Kill off any obsolete placeholder slots that are no longer needed.
    if(status === SLOT_STATUS.RELEASE) {
      parentSlot.slots[childView.slotIndex] = childSlot;
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
export function tryCommitOtherView<T>(state: ListState<T>, otherView: View<T>, expectedParent: View<T>, replacementParent: View<T>, slotIndexOffset: number): boolean {
  if(!isAncestor(expectedParent, otherView, state.size)) {
    return false;
  }

  if(!otherView.isEditable(state.group)) {
    otherView = otherView.cloneToGroup(state.group);
    state.setView(otherView);
  }

  while(otherView.parent !== expectedParent) {
    var otherParent = ascend(state.group, otherView, SLOT_STATUS.NO_CHANGE);
    otherView.setCommitted(otherParent);
    otherView = otherParent;
  }

  otherView.parent = replacementParent;
  otherView.slotIndex += slotIndexOffset;
  ascend(state.group, otherView, SLOT_STATUS.NO_CHANGE);
  otherView.setCommitted();

  return true;
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
function refocusView<T>(state: ListState<T>, view: View<T>, ordinal: number, asWriteTarget: boolean): View<T> {
  var shift = 0;
  var anchor = view.anchor;
  var otherView = anchor === OFFSET_ANCHOR.LEFT ? state.right : state.left;
  var isOtherViewUncommitted = true;
  var status = SLOT_STATUS.RELEASE;
  var branchFound = false, ascentComplete = false;

  // To avoid unnecessarily allocating new views during descent, and to avoid allocating an object or array to keep
  // track of reusable view instances, we will temporarily repurpose the parent property of any reusable views in order
  // build a makeshift stack.
  var nextReusableView = voidView;
  var childView = view;

  // Ascend to the closest ancestral node for which the specified ordinal index is a descendant.
  do {
    // Changes to the child node will be applied to the parent node, including setting a placeholder slot for the child
    // node if refocusing the view as a write target.
    var parentView = ascend(state.group, childView, status);

    // If the parent view is an ancestor of the other (left/right) view, and that view has uncommitted changes, they
    // should also be propagated to the parent view to ensure that updated sizes and slot counts are correct before
    // further operations targeting that node take place.
    if(isOtherViewUncommitted && tryCommitOtherView(state, otherView, childView.parent, parentView, 0)) {
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
      else if(childView.isEditable(state.group)) {
        // The child view was created as part of the current batch of operations, so instead of discarding it, add it to
        // the reusable view stack to avoid redundant allocations of new views during the descent.
        childView.parent = nextReusableView;
        nextReusableView = childView;
      }
      shift += CONST.BRANCH_INDEX_BITCOUNT;
    }

    // If the common upper branch node has been found but we want a write target, then we will continue the ascent until
    // it is guaranteed that the current path has been reserved with placeholder slots all the way back to the root.
    ascentComplete = branchFound && (!asWriteTarget || childView.isRoot() || childView.slot.isReserved());
    childView = parentView;

  } while(!ascentComplete);

  var slot = view.slot;
  var out = {slot, index: 0, offset: 0};
  var offset = view.offset;

  // Descend from the common ancestral branch node to the final node that owns the the destination ordinal position.
  do {
    slot.resolveChild(ordinal, shift, out);
    if(asWriteTarget) {
      // Now that we have the child slot, set the parent slot as a placeholder so that cheap changes can be made to
      // descendant nodes in the future without having to rewrite the entire ancestral slot path, which would normally
      // be required in order to avoid leaky references to obsolete nodes.
      slot.slots[out.index] = out.slot.cloneAsPlaceholder(state.group);
    }

    // Each descendant view needs to record the absolute offset of the referenced slot in order to quickly judge whether
    // or not that view's slot owns the subtree of a given ordinal that may be queried during future operations.
    offset += view.anchor === OFFSET_ANCHOR.LEFT ? out.offset : invertOffset(out.offset, out.slot.size, slot.size);
    slot = out.slot;

    // Reuse old views if possible during the descent, otherwise create new ones.
    if(nextReusableView === voidView) {
      view = new View<T>(view.group, offset, anchor, out.index, 0, 0, view, out.slot);
    }
    else {
      parentView = view;
      view = nextReusableView;
      nextReusableView = view.parent;
      view.parent = parentView;
      view.offset = offset;
      view.anchor = anchor;
      view.slotIndex = out.index;
      view.sizeDelta = 0;
      view.slotsDelta = 0;
      view.slot = slot;
    }

    shift -= CONST.BRANCH_INDEX_BITCOUNT;

  } while(shift > 0);

  state.setView(view);

  return view;
}

export function focusOrdinal<T>(state: ListState<T>, ordinal: number, asWriteTarget: boolean): View<T>|undefined {
  ordinal = normalizeIndex(state.size, ordinal);
  if(ordinal === -1) {
    return void 0;
  }
  var view = state.selectView(ordinal);
  return isViewInRange(view, ordinal, state.size) ? view
    : refocusView(state, view, ordinal, asWriteTarget);
}

export function focusHead<T>(state: ListState<T>, isWriteTarget: boolean): View<T> {
  var view = state.left;
  return view.offset ? view : refocusView(state, view, 0, isWriteTarget);
}

export function focusTail<T>(state: ListState<T>, isWriteTarget: boolean): View<T> {
  var view = state.left;
  return view.offset ? view : refocusView(state, view, state.size - 1, isWriteTarget);
}

export function getAtOrdinal<T>(state: ListState<T>, ordinal: number): T|undefined {
  // TODO: move into List<T>, seeing as MutableList<T> will be removed
  var view = focusOrdinal(state, ordinal, false);
  if(view === void 0) return void 0;
  return <T>view.slot.slots[ordinal - view.offset];
}