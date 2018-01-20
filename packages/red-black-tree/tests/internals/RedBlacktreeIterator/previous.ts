import test from 'ava';
import { iterateFromIndex } from '../../../src';
import { RedBlackTreeStructure } from '../../../src/internals';
import { createTree, sortedValues } from '../../test-utils';

let tree: RedBlackTreeStructure<number, string>;

test.beforeEach(() => {
  tree = createTree();
});

test('[forward] returns the adjacent key if no arguments are specified', t => {
  const itRight = iterateFromIndex(false, sortedValues.length - 1, tree);
  for(let i = sortedValues.length - 1; i >= 0; i--) {
    const current = itRight.previous();
    t.false(current.done);
    t.is(current.value.key, sortedValues[i]);
  }
  t.true(itRight.previous().done);
});

test('[reverse] returns the adjacent key if no arguments are specified', t => {
  const itLeft = iterateFromIndex(true, 0, tree);
  for(let i = 0; i < sortedValues.length; i++) {
    const current = itLeft.previous();
    t.false(current.done);
    t.is(current.value.key, sortedValues[i]);
  }
  t.true(itLeft.previous().done);
});

test('[key exists, forward] returns the specified key if inclusive = true', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itRight = iterateFromIndex(false, sortedValues.length - 1, tree);
    for(let i = sortedValues.length - 1; i >= 0; i -= n) {
      const current = itRight.previous(sortedValues[i]);
      t.false(current.done);
      t.is(current.value.key, sortedValues[i]);
    }
  }
});

test('[key exists, reverse] returns the specified key if inclusive = true', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itLeft = iterateFromIndex(true, 0, tree);
    for(let i = 0; i < sortedValues.length; i += n) {
      const current = itLeft.previous(sortedValues[i]);
      t.false(current.done);
      t.is(current.value.key, sortedValues[i]);
    }
  }
});

test('[key exists, forward] returns the key following the specified key if inclusive = false', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itLeft = iterateFromIndex(false, sortedValues.length - 1, tree);
    for(let i = sortedValues.length - 1; i >= 0; i -= n) {
      const current = itLeft.previous(sortedValues[i], false);
      if(i - 1 >= 0) {
        t.false(current.done);
        t.is(current.value.key, sortedValues[i - 1]);
      }
      else {
        t.true(current.done);
      }
    }
    t.true(itLeft.previous(sortedValues[0] - 1).done);
  }
});

test('[key exists, reverse] returns the key following the specified key if inclusive = false', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itRight = iterateFromIndex(true, 0, tree);
    for(let i = 0; i < sortedValues.length; i += n) {
      const current = itRight.previous(sortedValues[i], false);
      if(i + 1 < sortedValues.length) {
        t.false(current.done);
        t.is(current.value.key, sortedValues[i + 1]);
      }
      else {
        t.true(current.done);
      }
    }
    t.true(itRight.previous(sortedValues[sortedValues.length - 1] + 1).done);
  }
});
