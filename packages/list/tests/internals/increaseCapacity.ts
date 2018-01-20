import test from 'ava';
import { ListStructure, appendValues, arrayFrom, concatLists } from '../../src/internals';
import {
  BRANCH_FACTOR,
  headSize,
  headSlot,
  makeList,
  makeValues,
  rootSlot,
  slotValues,
  tailSize,
  tailSlot,
  values_BF,
  values_BFx2_p1,
  values_BFxBF,
  values_BFxBFxBF,
  values_BFxBFxBFxBF,
  values_h2_pBF_p1,
  values_h3_pBF_p1,
  values_h4_pBF_p1
} from '../helpers';

const canGrow = 'can grow beyond the size of the default branching factor';
test(`${canGrow} when appending`, t => {
  const list = makeList(values_BFx2_p1, 1, false);
  t.is(list._size, values_BFx2_p1.length);
  t.deepEqual(slotValues(headSlot(list, t)), values_BFx2_p1.slice(0, BRANCH_FACTOR));
  t.deepEqual(slotValues(tailSlot(list, t)), values_BFx2_p1.slice(BRANCH_FACTOR*2));
  t.is(headSize(list, t), BRANCH_FACTOR);
  t.is(tailSize(list, t), 1);
});

test(`${canGrow} when prepending`, t => {
  const list = makeList(values_BFx2_p1, 1, true);
  t.is(list._size, values_BFx2_p1.length);
  t.deepEqual(arrayFrom(list), values_BFx2_p1.slice(1).concat(values_BFx2_p1.slice(0, 1)));
  t.is(headSize(list, t), 1);
  t.is(tailSize(list, t), BRANCH_FACTOR);
});

const increasesDepth = 'increases depth when the root is full';
test(`${increasesDepth} when appending`, t => {
  const listH2 = makeList(values_BFx2_p1, 1, false);
  const listH3 = makeList(values_h2_pBF_p1, 1, false);
  const listH4 = makeList(values_h3_pBF_p1, 1, false);
  const listH5 = makeList(values_h4_pBF_p1, 1, false);

  t.is(listH2._size, values_BFx2_p1.length);
  t.is(listH3._size, values_h2_pBF_p1.length);
  t.is(listH4._size, values_h3_pBF_p1.length);
  t.is(listH5._size, values_h4_pBF_p1.length);
  t.deepEqual(arrayFrom(listH2), values_BFx2_p1, 'listH2 values are not correct');
  t.deepEqual(arrayFrom(listH3), values_h2_pBF_p1, 'listH3 values are not correct');
  t.deepEqual(arrayFrom(listH4), values_h3_pBF_p1, 'listH4 values are not correct');
  t.deepEqual(arrayFrom(listH5), values_h4_pBF_p1, 'listH5 values are not correct');
  t.true(rootSlot(listH2).group > 0, `root slot of listH2 should not be reserved`);
  t.true(rootSlot(listH3).group > 0, `root slot of listH2 should not be reserved`);
  t.true(rootSlot(listH4).group > 0, `root slot of listH2 should not be reserved`);
  t.true(rootSlot(listH5).group > 0, `root slot of listH2 should not be reserved`);
});

test(`${increasesDepth} when prepending`, t => {
  const listH2 = makeList(values_BFx2_p1, 1, true);
  const listH3 = makeList(values_h2_pBF_p1, 1, true);
  const listH4 = makeList(values_h3_pBF_p1, 1, true);
  const listH5 = makeList(values_h4_pBF_p1, 1, true);

  t.is(listH2._size, values_BFx2_p1.length);
  t.is(listH3._size, values_h2_pBF_p1.length);
  t.is(listH4._size, values_h3_pBF_p1.length);
  t.is(listH5._size, values_h4_pBF_p1.length);
  t.deepEqual(arrayFrom(listH2), values_BFx2_p1.slice(1).concat(values_BFx2_p1.slice(0, 1)), 'listH2 values are not correct');
  t.deepEqual(arrayFrom(listH3), values_h2_pBF_p1.slice(1).concat(values_h2_pBF_p1.slice(0, 1)), 'listH3 values are not correct');
  t.deepEqual(arrayFrom(listH4), values_h3_pBF_p1.slice(1).concat(values_h3_pBF_p1.slice(0, 1)), 'listH4 values are not correct');
  t.deepEqual(arrayFrom(listH5), values_h4_pBF_p1.slice(1).concat(values_h4_pBF_p1.slice(0, 1)), 'listH5 values are not correct');
  t.true(rootSlot(listH2).group > 0, `root slot of listH2 should not be reserved`);
  t.true(rootSlot(listH3).group > 0, `root slot of listH2 should not be reserved`);
  t.true(rootSlot(listH4).group > 0, `root slot of listH2 should not be reserved`);
  t.true(rootSlot(listH5).group > 0, `root slot of listH2 should not be reserved`);
});

const growsCorrectly = 'grows correctly when the number of appended elements is perfectly divisible by the branch factor';
test(`${growsCorrectly} when appending`, t => {
  const listH2 = makeList(values_BF, 0, false);
  const listH3 = makeList(values_BFxBF, 0, false);
  const listH4 = makeList(values_BFxBFxBF, 0, false);
  const listH5 = makeList(values_BFxBFxBFxBF, 0, false);
  t.is(listH2._size, values_BF.length);
  t.is(listH3._size, values_BFxBF.length);
  t.is(listH4._size, values_BFxBFxBF.length);
  t.is(listH5._size, values_BFxBFxBFxBF.length);
  t.deepEqual(arrayFrom(listH2), values_BF, 'listH2 values are not correct');
  t.deepEqual(arrayFrom(listH3), values_BFxBF, 'listH3 values are not correct');
  t.deepEqual(arrayFrom(listH4), values_BFxBFxBF, 'listH4 values are not correct');
  t.deepEqual(arrayFrom(listH5), values_BFxBFxBFxBF, 'listH5 values are not correct');
});

test(`${growsCorrectly} when prepending`, t => {
  const listH2 = makeList(values_BF, 0, true);
  const listH3 = makeList(values_BFxBF, 0, true);
  const listH4 = makeList(values_BFxBFxBF, 0, true);
  const listH5 = makeList(values_BFxBFxBFxBF, 0, true);
  t.is(listH2._size, values_BF.length);
  t.is(listH3._size, values_BFxBF.length);
  t.is(listH4._size, values_BFxBFxBF.length);
  t.is(listH5._size, values_BFxBFxBFxBF.length);
  t.deepEqual(arrayFrom(listH2), values_BF, 'listH2 values are not correct');
  t.deepEqual(arrayFrom(listH3), values_BFxBF, 'listH3 values are not correct');
  t.deepEqual(arrayFrom(listH4), values_BFxBFxBF, 'listH4 values are not correct');
  t.deepEqual(arrayFrom(listH5), values_BFxBFxBFxBF, 'listH5 values are not correct');
});

test(`maintains the recompute property of relaxed nodes when appending`, t => {
  const n0 = BRANCH_FACTOR - 1;
  const n1 = BRANCH_FACTOR - 2;
  var list0: ListStructure<any>;
  concatLists(list0 = makeList(makeValues(n0), 1, false), makeList(makeValues(n1, n0), 1, false));
  appendValues(list0, ['X', 'Y', 'Z', 'K']);
  const root = rootSlot(list0);
  t.is(root.subcount, n0 + n1 + 4);
  t.is(root.size, n0 + n1 + 4);
  t.is(root.recompute, 2);
});

test(`creates a relaxed node when growing a tree from a relaxed root when appending`, t => {
  const n0 = BRANCH_FACTOR - 1;
  const n1 = Math.pow(BRANCH_FACTOR, 2) - n0 - 1;
  var list0: ListStructure<any>;
  concatLists(list0 = makeList(makeValues(n0), 1, false), makeList(makeValues(n1, n0), 1, false));
  appendValues(list0, ['X']);
  const root = rootSlot(list0);
  t.is(root.subcount, BRANCH_FACTOR + 1);
  t.is(root.size, n0 + n1 + 1);
  t.is(root.recompute, 2);
});
