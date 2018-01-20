import test from 'ava';
import { fromNumericKeys, iterateFromFirst, iterateFromLast } from '../../../src';
import { RedBlackTreeStructure } from '../../../src/internals';
import { createTree, sortedValues } from '../../test-utils';

let tree: RedBlackTreeStructure<number, string>;

test.beforeEach(() => {
  tree = createTree();
});

test('[forward] returns the adjacent key if no arguments are specified', t => {
  const itRight = iterateFromFirst(tree);
  for(let i = 0; i < sortedValues.length; i++) {
    const current = itRight.next();
    t.false(current.done);
    t.is(current.value.key, sortedValues[i]);
  }
  t.true(itRight.next().done);
});

test('[reverse] returns the adjacent key if no arguments are specified', t => {
  const itLeft = iterateFromLast(tree);
  for(let i = sortedValues.length - 1; i >= 0; i--) {
    const current = itLeft.next();
    t.false(current.done);
    t.is(current.value.key, sortedValues[i]);
  }
  t.true(itLeft.next().done);
});

test('[forward] always ignores the current key', t => {
  const it = iterateFromFirst(fromNumericKeys([3, 5, 7]));
  const first = it.next();
  const second = it.next(3, false);
  const third = it.next(5, true);
  const final = it.next(7);
  t.is(first.value.key, 3);
  t.is(second.value.key, 5);
  t.is(third.value.key, 7);
  t.true(final.done);
});

test('[reverse] always ignores the current key', t => {
  const it = iterateFromLast(fromNumericKeys([3, 5, 7]));
  const first = it.next();
  const second = it.next(7, false);
  const third = it.next(5, true);
  const final = it.next(3);
  t.is(first.value.key, 7);
  t.is(second.value.key, 5);
  t.is(third.value.key, 3);
  t.true(final.done);
});

test('[key exists, forward] returns the specified key if inclusive = true', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itRight = iterateFromFirst(tree);
    for(let i = 0; i < sortedValues.length; i += n) {
      const current = itRight.next(sortedValues[i]);
      t.false(current.done);
      t.is(current.value.key, sortedValues[i]);
    }
  }
});

test('[key exists, reverse] returns the specified key if inclusive = true', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itLeft = iterateFromLast(tree);
    for(let i = sortedValues.length - 1; i >= 0; i -= n) {
      const current = itLeft.next(sortedValues[i]);
      t.false(current.done);
      t.is(current.value.key, sortedValues[i]);
    }
  }
});

test('[key exists, forward] returns the key following the specified key if inclusive = false', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itRight = iterateFromFirst(tree);
    for(let i = 0; i < sortedValues.length; i += n) {
      const current = itRight.next(sortedValues[i], false);
      if(i + 1 < sortedValues.length) {
        t.false(current.done);
        t.is(current.value.key, sortedValues[i + 1]);
      }
      else {
        t.true(current.done);
      }
    }
    t.true(itRight.next(sortedValues[sortedValues.length - 1] + 1).done);
  }
});

test('[key exists, reverse] returns the key following the specified key if inclusive = false', t => {
  for(let n = 1; n < sortedValues.length; n++) {
    const itLeft = iterateFromLast(tree);
    for(let i = sortedValues.length - 1; i >= 0; i -= n) {
      const current = itLeft.next(sortedValues[i], false);
      if(i - 1 >= 0) {
        t.false(current.done);
        t.is(current.value.key, sortedValues[i - 1]);
      }
      else {
        t.true(current.done);
      }
    }
    t.true(itLeft.next(sortedValues[0] - 1).done);
  }
});
