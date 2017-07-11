import {assert} from 'chai';
import {fromNumericKeys, iterateFromFirst, iterateFromLast, iterateFromIndex} from '../../src';
import {RedBlackTreeStructure} from '../../src/internals';
import {empty, createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeStructure<number, string>,
    emptyTree: RedBlackTreeStructure<any, any>;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('RedBlackTreeIterator', () => {
    suite('#next()', () => {
      test('[forward] returns the adjacent key if no arguments are specified', () => {
        const itRight = iterateFromFirst(tree);
        for(let i = 0; i < sortedValues.length; i++) {
          const current = itRight.next();
          assert.isFalse(current.done);
          assert.strictEqual(current.value.key, sortedValues[i]);
        }
        assert.isTrue(itRight.next().done);
      });

      test('[reverse] returns the adjacent key if no arguments are specified', () => {
        const itLeft = iterateFromLast(tree);
        for(let i = sortedValues.length - 1; i >= 0; i--) {
          const current = itLeft.next();
          assert.isFalse(current.done);
          assert.strictEqual(current.value.key, sortedValues[i]);
        }
        assert.isTrue(itLeft.next().done);
      });

      test('[forward] always ignores the current key', () => {
        const it = iterateFromFirst(fromNumericKeys([3, 5, 7]));
        const first = it.next();
        const second = it.next(3, false);
        const third = it.next(5, true);
        const final = it.next(7);
        assert.strictEqual(first.value.key, 3);
        assert.strictEqual(second.value.key, 5);
        assert.strictEqual(third.value.key, 7);
        assert.isTrue(final.done);
      });

      test('[reverse] always ignores the current key', () => {
        const it = iterateFromLast(fromNumericKeys([3, 5, 7]));
        const first = it.next();
        const second = it.next(7, false);
        const third = it.next(5, true);
        const final = it.next(3);
        assert.strictEqual(first.value.key, 7);
        assert.strictEqual(second.value.key, 5);
        assert.strictEqual(third.value.key, 3);
        assert.isTrue(final.done);
      });

      test('[key exists, forward] returns the specified key if inclusive = true', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itRight = iterateFromFirst(tree);
          for(let i = 0; i < sortedValues.length; i += n) {
            const current = itRight.next(sortedValues[i]);
            assert.isFalse(current.done);
            assert.strictEqual(current.value.key, sortedValues[i]);
          }
        }
      });

      test('[key exists, reverse] returns the specified key if inclusive = true', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itLeft = iterateFromLast(tree);
          for(let i = sortedValues.length - 1; i >= 0; i -= n) {
            const current = itLeft.next(sortedValues[i]);
            assert.isFalse(current.done);
            assert.strictEqual(current.value.key, sortedValues[i]);
          }
        }
      });

      test('[key exists, forward] returns the key following the specified key if inclusive = false', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itRight = iterateFromFirst(tree);
          for(let i = 0; i < sortedValues.length; i += n) {
            const current = itRight.next(sortedValues[i], false);
            if(i + 1 < sortedValues.length) {
              assert.isFalse(current.done);
              assert.strictEqual(current.value.key, sortedValues[i + 1]);
            }
            else {
              assert.isTrue(current.done);
            }
          }
          assert.isTrue(itRight.next(sortedValues[sortedValues.length - 1] + 1).done);
        }
      });

      test('[key exists, reverse] returns the key following the specified key if inclusive = false', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itLeft = iterateFromLast(tree);
          for(let i = sortedValues.length - 1; i >= 0; i -= n) {
            const current = itLeft.next(sortedValues[i], false);
            if(i - 1 >= 0) {
              assert.isFalse(current.done);
              assert.strictEqual(current.value.key, sortedValues[i - 1]);
            }
            else {
              assert.isTrue(current.done);
            }
          }
          assert.isTrue(itLeft.next(sortedValues[0] - 1).done);
        }
      });
    });

    suite('#previous()', () => {
      test('[forward] returns the adjacent key if no arguments are specified', () => {
        const itRight = iterateFromIndex(false, sortedValues.length - 1, tree);
        for(let i = sortedValues.length - 1; i >= 0; i--) {
          const current = itRight.previous();
          assert.isFalse(current.done);
          assert.strictEqual(current.value.key, sortedValues[i]);
        }
        assert.isTrue(itRight.previous().done);
      });

      test('[reverse] returns the adjacent key if no arguments are specified', () => {
        const itLeft = iterateFromIndex(true, 0, tree);
        for(let i = 0; i < sortedValues.length; i++) {
          const current = itLeft.previous();
          assert.isFalse(current.done);
          assert.strictEqual(current.value.key, sortedValues[i]);
        }
        assert.isTrue(itLeft.previous().done);
      });

      test('[key exists, forward] returns the specified key if inclusive = true', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itRight = iterateFromIndex(false, sortedValues.length - 1, tree);
          for(let i = sortedValues.length - 1; i >= 0; i -= n) {
            const current = itRight.previous(sortedValues[i]);
            assert.isFalse(current.done);
            assert.strictEqual(current.value.key, sortedValues[i]);
          }
        }
      });

      test('[key exists, reverse] returns the specified key if inclusive = true', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itLeft = iterateFromIndex(true, 0, tree);
          for(let i = 0; i < sortedValues.length; i += n) {
            const current = itLeft.previous(sortedValues[i]);
            assert.isFalse(current.done);
            assert.strictEqual(current.value.key, sortedValues[i]);
          }
        }
      });

      test('[key exists, forward] returns the key following the specified key if inclusive = false', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itLeft = iterateFromIndex(false, sortedValues.length - 1, tree);
          for(let i = sortedValues.length - 1; i >= 0; i -= n) {
            const current = itLeft.previous(sortedValues[i], false);
            if(i - 1 >= 0) {
              assert.isFalse(current.done);
              assert.strictEqual(current.value.key, sortedValues[i - 1]);
            }
            else {
              assert.isTrue(current.done);
            }
          }
          assert.isTrue(itLeft.previous(sortedValues[0] - 1).done);
        }
      });

      test('[key exists, reverse] returns the key following the specified key if inclusive = false', () => {
        for(let n = 1; n < sortedValues.length; n++) {
          const itRight = iterateFromIndex(true, 0, tree);
          for(let i = 0; i < sortedValues.length; i += n) {
            const current = itRight.previous(sortedValues[i], false);
            if(i + 1 < sortedValues.length) {
              assert.isFalse(current.done);
              assert.strictEqual(current.value.key, sortedValues[i + 1]);
            }
            else {
              assert.isTrue(current.done);
            }
          }
          assert.isTrue(itRight.previous(sortedValues[sortedValues.length - 1] + 1).done);
        }
      });
    });
  });
});