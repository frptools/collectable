import test from 'ava';
import { iterateFromIndex } from '../../src';
import { RedBlackTreeStructure } from '../../src/internals';
import { createTree, sortedValues } from '../test-utils';

let tree: RedBlackTreeStructure<any, any>;

test.beforeEach(() => {
  tree = createTree();
});

test('returns an iterator starting from the specified index (negative index offset from the right)', t => {
  const expectedLeft = sortedValues.slice(25);
  const expectedRight = sortedValues.slice(sortedValues.length - 25);
  const expectedLeftReversed = sortedValues.slice(0, 25 + 1).reverse();
  const expectedRightReversed = sortedValues.slice(0, sortedValues.length - 25 + 1).reverse();

  const arrayLeft = Array.from(iterateFromIndex(false, 25, tree)).map(v => v.key);
  const arrayRight = Array.from(iterateFromIndex(false, -25, tree)).map(v => v.key);
  const arrayLeftReversed = Array.from(iterateFromIndex(true, 25, tree)).map(v => v.key);
  const arrayRightReversed = Array.from(iterateFromIndex(true, -25, tree)).map(v => v.key);

  t.deepEqual(arrayLeft, expectedLeft);
  t.deepEqual(arrayRight, expectedRight);
  t.deepEqual(arrayLeftReversed, expectedLeftReversed);
  t.deepEqual(arrayRightReversed, expectedRightReversed);
});

test('the iterator should be in a completed state if the resolved index is out of range', t => {
  t.true(iterateFromIndex(false, sortedValues.length, tree).next().done);
  t.true(iterateFromIndex(false, -1 - sortedValues.length, tree).next().done);
  t.true(iterateFromIndex(true, sortedValues.length, tree).next().done);
  t.true(iterateFromIndex(true, -1 - sortedValues.length, tree).next().done);
});
