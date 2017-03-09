import {assert} from 'chai';
import {empty, get, iterateFromKey} from '../../src';
import {RedBlackTreeImpl} from '../../src/internals';
import {createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeImpl<any, any>, emptyTree;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('get()', () => {
    test('returns undefined if the key does not exist in the list', () => {
      assert.strictEqual(get(1, emptyTree), void 0);
    });

    test('returns the value associated with the specified key', () => {
      for(var i = 0; i < sortedValues.length; i++) {
        assert.strictEqual(get(sortedValues[i], tree), `#${sortedValues[i]}`);
      }
    });
  });

  suite('iterateFromKey()', () => {
    test('returns an iterator starting from the specified key', () => {
      const it = iterateFromKey(false, sortedValues[5], tree);
      assert.deepEqual(Array.from(it).map(n => n.key), sortedValues.slice(5));
    });

    test('the iterator should be in a completed state if the key was not found', () => {
      const it = iterateFromKey(false, sortedValues[5], emptyTree);
      assert.isTrue(it.next().done);
    });
  });
});