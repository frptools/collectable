import {assert} from 'chai';
import {empty, get} from '../../src';
import {createTree, sortedValues} from '../test-utils';

suite('[RedBlackTree]', () => {
  suite('get()', () => {
    test('should return undefined if the value does not exist in the list', () => {
      const tree = empty();
      assert.strictEqual(get(1, tree), void 0);
    });

    test('should return the value associated with the specified key', () => {
      const tree = createTree();
      for(var i = 0; i < sortedValues.length; i++) {
        assert.strictEqual(get(sortedValues[i], tree), `#${sortedValues[i]}`);
      }
    });
  });
});