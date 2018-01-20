import test from 'ava';
import { isImmutable } from '@collectable/core';
import { set, updateTree, values } from '../../src';
import { createTree, sortedValues } from '../test-utils';

test('treats the inner tree as mutable', t => {
  const tree = createTree();
  const tree1 = updateTree(tree => {
    t.false(isImmutable(tree));
    set(1, '#1', tree);
  }, tree);
  t.true(isImmutable(tree1));
  t.deepEqual(Array.from(values(tree1)), [1].concat(sortedValues).map(n => `#${n}`));
});
