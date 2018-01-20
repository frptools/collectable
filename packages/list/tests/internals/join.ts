import test from 'ava';
import { Slot, join, } from '../../src/internals';
import { BRANCH_FACTOR, BRANCH_INDEX_BITCOUNT, gatherLeafValues, makeStandardSlot } from '../helpers';

function makeJoinablePair (height: number, subtractLeftSize = 0, subtractRightSize = 0): [Slot<string>, Slot<string>] {
  var level = height - 1;
  var left = makeStandardSlot((((BRANCH_FACTOR >>> 1) - 1) << (level*BRANCH_INDEX_BITCOUNT)) - subtractLeftSize, level, 0);
  var right = makeStandardSlot(((BRANCH_FACTOR >>> 1) << (level*BRANCH_INDEX_BITCOUNT)) - subtractRightSize, level, left.size);
  return [left, right];
}

const whenShouldMerge = 'When passed a pair of topmost nodes that should be merged into a single node';
test(`${whenShouldMerge} the function returns true`, t => {
  var joined = join(makeJoinablePair(2), BRANCH_INDEX_BITCOUNT, true);
  t.true(joined);
});

test(`${whenShouldMerge} all of the slots in the right node are moved to the left node`, t => {
  var nodes = makeJoinablePair(2);
  var leftSize = nodes[0].size;
  var rightSize = nodes[1].size;
  join(nodes, BRANCH_INDEX_BITCOUNT, true);
  t.is(nodes[0].size, leftSize + rightSize);
  t.is(nodes[1].size, 0);
});

test(`${whenShouldMerge} the cumulative sum is recalculated for each slot`, t => {
  var nodes = makeJoinablePair(3);
  join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
  for(var i = 0, sum = 0; i < nodes[0].slots.length; i++) {
    sum += BRANCH_FACTOR << BRANCH_INDEX_BITCOUNT;
    t.is((<Slot<string>>nodes[0].slots[i]).sum, sum);
  }
});

test(`${whenShouldMerge} the left node does not change into a relaxed node if all of the left slots were fully populated`, t => {
  var nodes = makeJoinablePair(3);
  join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
  t.false(nodes[0].isRelaxed());
});

test(`${whenShouldMerge} the left node becomes a relaxed node if any slots other than the last are not fully populated`, t => {
  var nodes = makeJoinablePair(3, 1);
  join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
  t.true(nodes[0].isRelaxed());
});

test(`${whenShouldMerge} the subcount of the right node is added to the subcount of the left node`, t => {
  var nodes = makeJoinablePair(3);
  var leftSubcount = nodes[0].subcount, rightSubcount = nodes[1].subcount;
  join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
  t.is(nodes[0].subcount, leftSubcount + rightSubcount);
});

test(`${whenShouldMerge} non-leaf nodes are joined correctly`, t => {
  var nodes = makeJoinablePair(3);
  var expectedValues = gatherLeafValues(makeStandardSlot(nodes[0].size + nodes[1].size, 2, 0), false);
  join(nodes, BRANCH_INDEX_BITCOUNT*2, true);
  t.deepEqual(gatherLeafValues(nodes[0], false), expectedValues);
});

test(`${whenShouldMerge} leaf nodes are joined correctly`, t => {
  var nodes = makeJoinablePair(1);
  var expectedValues = gatherLeafValues(makeStandardSlot(nodes[0].size + nodes[1].size, 0, 0), false);
  join(nodes, 0, true);
  t.deepEqual(gatherLeafValues(nodes[0], false), expectedValues);
});

const whenBalanceUnnecessary = 'When passed a pair of nodes that do not need to be balanced,';
test(`${whenBalanceUnnecessary} the function returns false`, t => {
  var left = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2) - 1, 2, 0);
  var right = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2), 2, 0);

  t.false(join([left, right], BRANCH_INDEX_BITCOUNT*2, false));
});

test(`${whenBalanceUnnecessary} the input nodes are not modified`, t => {
  var left = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2) - 1, 2, 0);
  var right = makeStandardSlot(BRANCH_FACTOR << (BRANCH_INDEX_BITCOUNT*2), 2, 0);
  var nodes: [Slot<string>, Slot<string>] = [left, right];
  var leftJSON = JSON.stringify(left);
  var rightJSON = JSON.stringify(right);

  join(nodes, BRANCH_INDEX_BITCOUNT*2, false);

  t.is(leftJSON, JSON.stringify(nodes[0]));
  t.is(rightJSON, JSON.stringify(nodes[1]));
});
