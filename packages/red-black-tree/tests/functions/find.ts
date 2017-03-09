import {assert} from 'chai';
import {RedBlackTreeEntry, find, findKey, findValue, iterateFrom} from '../../src';
import {RedBlackTreeImpl} from '../../src/internals';
import {empty, createTree, sortedValues} from '../test-utils';

var tree: RedBlackTreeImpl<number, string>,
    emptyTree: RedBlackTreeImpl<any, any>;

suite('[RedBlackTree]', () => {
  setup(() => {
    emptyTree = empty();
    tree = createTree();
  });

  suite('find()', () => {
    suite('[gt]', () => {
      test('fails to find a match if the last key in the tree is less than or equal to the specified key', () => {
        const node = find('gt', sortedValues[sortedValues.length - 1], tree);
        assert.isUndefined(node);
      });

      test('matches the leftmost node that has a key that is greater than the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          var expected = i === sortedValues.length - 1 ? void 0 : sortedValues[i + 1];
          var key = sortedValues[i];

          // #1: check keys known to exist in the tree
          var node = <RedBlackTreeEntry<any, any>>find('gt', key, tree);
          if(expected === void 0) {
            assert.isUndefined(node);
          }
          else {
            assert.isDefined(node);
            assert.strictEqual(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
          }

          // #2: check intermediate keys that do not exist in the tree
          key++;
          if(key !== expected) {
            node = <RedBlackTreeEntry<any, any>>find('gt', key, tree);
            if(expected === void 0) {
              assert.isUndefined(node);
            }
            else {
              assert.isDefined(node);
              assert.strictEqual(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
            }
          }
        }
      });
    });

    suite('[gte]', () => {
      test('fails to find a match if the last key in the tree is less than the specified key', () => {
        const node = find('gte', sortedValues[sortedValues.length - 1] + 1, tree);
        assert.isUndefined(node);
      });

      test('matches the leftmost node that has a key that is greater than or equal to the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var node = <RedBlackTreeEntry<any, any>>find('gte', key, tree);
          assert.isDefined(node);
          assert.strictEqual(node.key, key, `i: ${i}, key: ${key}, found: ${node.key}`);

          // #2: check intermediate keys that do not exist in the tree
          key++;
          var expected = i === sortedValues.length - 1 ? void 0 : sortedValues[i + 1];
          node = <RedBlackTreeEntry<any, any>>find('gte', key, tree);
          if(expected === void 0) {
            assert.isUndefined(node);
          }
          else {
            assert.isDefined(node);
            assert.strictEqual(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
          }
        }
      });
    });

    suite('[lt]', () => {
      test('fails to find a match if the first key in the tree is greater than or equal to the specified key', () => {
        const node = find('lt', sortedValues[0], tree);
        assert.isUndefined(node);
      });

      test('matches the rightmost node that has a key that is less than the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          var expected = i === 0 ? void 0 : sortedValues[i - 1];
          var key = sortedValues[i];

          // #1: check keys known to exist in the tree
          var node = <RedBlackTreeEntry<any, any>>find('lt', key, tree);
          if(expected === void 0) {
            assert.isUndefined(node);
          }
          else {
            assert.isDefined(node);
            assert.strictEqual(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
          }

          // #2: check intermediate keys that do not exist in the tree
          key--;
          if(key !== expected) {
            node = <RedBlackTreeEntry<any, any>>find('lt', key, tree);
            if(expected === void 0) {
              assert.isUndefined(node);
            }
            else {
              assert.isDefined(node);
              assert.strictEqual(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
            }
          }
        }
      });
    });

    suite('[lte]', () => {
      test('fails to find a match if the first key in the tree is greater than the specified key', () => {
        const node = find('lte', sortedValues[0] - 1, tree);
        assert.isUndefined(node);
      });

      test('matches the rightmost node that has a key that is less than or equal to the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var node = <RedBlackTreeEntry<any, any>>find('lte', key, tree);
          assert.isDefined(node);
          assert.strictEqual(node.key, key, `i: ${i}, key: ${key}, found: ${node.key}`);

          // #2: check intermediate keys that do not exist in the tree
          key--;
          var expected = i === 0 ? void 0 : sortedValues[i - 1];
          node = <RedBlackTreeEntry<any, any>>find('lte', key, tree);
          if(expected === void 0) {
            assert.isUndefined(node);
          }
          else {
            assert.isDefined(node);
            assert.strictEqual(node.key, expected, `i: ${i}, find: ${key}, found: ${node.key}, expected: ${expected}`);
          }
        }
      });
    });
  });

  suite('findKey()', () => {
    test('returns undefined if the tree is empty', () => {
      const akey = findKey('gt', sortedValues[0], emptyTree);
      const lkey = findKey('gte', sortedValues[25], emptyTree);
      const rkey = findKey('lt', sortedValues[sortedValues.length - 25], emptyTree);
      const zkey = findKey('lte', sortedValues[sortedValues.length - 1], emptyTree);
      assert.isUndefined(akey);
      assert.isUndefined(lkey);
      assert.isUndefined(rkey);
      assert.isUndefined(zkey);
    });

    test('returns the key of the node that best matches the condition', () => {
      const anode = <RedBlackTreeEntry<any, any>>find('gt', sortedValues[0], tree);
      const akey = findKey('gt', sortedValues[0], tree);
      const lnode = <RedBlackTreeEntry<any, any>>find('gte', sortedValues[25], tree);
      const lkey = findKey('gte', sortedValues[25], tree);
      const rnode = <RedBlackTreeEntry<any, any>>find('lt', sortedValues[sortedValues.length - 25], tree);
      const rkey = findKey('lt', sortedValues[sortedValues.length - 25], tree);
      const znode = <RedBlackTreeEntry<any, any>>find('lte', sortedValues[sortedValues.length - 1], tree);
      const zkey = findKey('lte', sortedValues[sortedValues.length - 1], tree);
      assert.strictEqual(akey, anode.key);
      assert.strictEqual(lkey, lnode.key);
      assert.strictEqual(rkey, rnode.key);
      assert.strictEqual(zkey, znode.key);
    });
  });

  suite('findValue()', () => {
    test('returns undefined if the tree is empty', () => {
      const avalue = findValue('gt', sortedValues[0], emptyTree);
      const lvalue = findValue('gte', sortedValues[25], emptyTree);
      const rvalue = findValue('lt', sortedValues[sortedValues.length - 25], emptyTree);
      const zvalue = findValue('lte', sortedValues[sortedValues.length - 1], emptyTree);
      assert.isUndefined(avalue);
      assert.isUndefined(lvalue);
      assert.isUndefined(rvalue);
      assert.isUndefined(zvalue);
    });

    test('returns the value of the node that best matches the condition', () => {
      const anode = <RedBlackTreeEntry<any, any>>find('gt', sortedValues[0], tree);
      const avalue = findValue('gt', sortedValues[0], tree);
      const lnode = <RedBlackTreeEntry<any, any>>find('gte', sortedValues[25], tree);
      const lvalue = findValue('gte', sortedValues[25], tree);
      const rnode = <RedBlackTreeEntry<any, any>>find('lt', sortedValues[sortedValues.length - 25], tree);
      const rvalue = findValue('lt', sortedValues[sortedValues.length - 25], tree);
      const znode = <RedBlackTreeEntry<any, any>>find('lte', sortedValues[sortedValues.length - 1], tree);
      const zvalue = findValue('lte', sortedValues[sortedValues.length - 1], tree);
      assert.strictEqual(avalue, anode.value);
      assert.strictEqual(lvalue, lnode.value);
      assert.strictEqual(rvalue, rnode.value);
      assert.strictEqual(zvalue, znode.value);
    });
  });

  suite('iterateFrom()', () => {
    suite('[gt]', () => {
      test('returns an empty iterator if the last key in the tree is less than or equal to the specified key', () => {
        const result = iterateFrom('gt', false, sortedValues[sortedValues.length - 1], tree);
        assert.isTrue(result.next().done);
      });

      test('[forward] iterates from the leftmost node that has a key that is greater than the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('gt', false, key, tree);
          if(i === sortedValues.length - 1) {
            assert.isTrue(it.next().done);
          }
          else {
            var results = Array.from(it).map(n => n.key);
            var expected = sortedValues.slice(i + 1);
            assert.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

            // #2: check intermediate keys that do not exist in the tree
            key++;
            if(key !== expected[0]) {
              it = iterateFrom('gt', false, key, tree);
              results = Array.from(it).map(n => n.key);
              assert.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
            }
          }
        }
      });

      test('[reverse] iterates from the leftmost node that has a key that is greater than the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('gt', true, key, tree);
          if(i === sortedValues.length - 1) {
            assert.isTrue(it.next().done);
          }
          else {
            var results = Array.from(it).map(n => n.key);
            var expected = sortedValues.slice(0, i + 2).reverse();
            assert.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

            // #2: check intermediate keys that do not exist in the tree
            key++;
            if(key !== expected[0]) {
              it = iterateFrom('gt', true, key, tree);
              results = Array.from(it).map(n => n.key);
              assert.deepEqual(results, expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
            }
          }
        }
      });
    });

    suite('[gte]', () => {
      test('returns an empty iterator if the last key in the tree is less than the specified key', () => {
        const result = iterateFrom('gte', false, sortedValues[sortedValues.length - 1] + 1, tree);
        assert.isTrue(result.next().done);
      });

      test('[forward] iterates from the leftmost node that has a key that is greater than or equal to the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('gte', false, key, tree);
          var results = Array.from(it);
          var expected = sortedValues.slice(i);
          assert.strictEqual(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
          assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

          // #2: check intermediate keys that do not exist in the tree
          key++;
          if(key !== expected[1]) {
            it = iterateFrom('gte', false, key, tree);
            results = Array.from(it);
            assert.deepEqual(results.map(n => n.key), expected.slice(1), `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
          }
        }
      });

      test('[reverse] iterates from the leftmost node that has a key that is greater than or equal to the specified key', () => {
        for(var i = 0; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('gte', true, key, tree);
          var results = Array.from(it);
          var expected = sortedValues.slice(0, i + 1).reverse();
          assert.strictEqual(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
          assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

          // #2: check intermediate keys that do not exist in the tree
          key++;
          if(key !== sortedValues[i + 1]) {
            it = iterateFrom('gte', true, key, tree);
            expected = key > sortedValues[sortedValues.length - 1] ? [] : sortedValues.slice(0, i + 2).reverse();
            results = Array.from(it);
            assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
          }
        }
      });
    });

    suite('[lt]', () => {
      test('returns an empty iterator if the first key in the tree is greater than or equal to the specified key', () => {
        const result = iterateFrom('lt', false, sortedValues[0], tree);
        assert.isTrue(result.next().done);
      });

      test('[forward] iterates from the rightmost node that has a key that is less than the specified key', () => {
        for(var i = 3; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('lt', false, key, tree);
          if(i === 0) {
            assert.isTrue(it.next().done);
          }
          else {
            var results = Array.from(it);
            var expected = sortedValues.slice(i - 1);
            assert.strictEqual(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
            assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

            // #2: check intermediate keys that do not exist in the tree
            key--;
            if(key !== expected[0]) {
              it = iterateFrom('lt', false, key, tree);
              results = Array.from(it);
              assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
            }
          }
        }
      });

      test('[reverse] iterates from the rightmost node that has a key that is less than the specified key', () => {
        for(var i = 3; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('lt', true, key, tree);
          if(i === 0) {
            assert.isTrue(it.next().done);
          }
          else {
            var results = Array.from(it);
            var expected = sortedValues.slice(0, i).reverse();
            assert.strictEqual(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
            assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

            // #2: check intermediate keys that do not exist in the tree
            key--;
            if(key !== expected[0]) {
              it = iterateFrom('lt', true, key, tree);
              results = Array.from(it);
              assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
            }
          }
        }
      });
    });

    suite('[lte]', () => {
      test('returns an empty iterator if the first key in the tree is greater than the specified key', () => {
        const result = iterateFrom('lte', false, sortedValues[0] - 1, tree);
        assert.isTrue(result.next().done);
      });

      test('[forward] iterates from the rightmost node that has a key that is less than or equal to the specified key', () => {
        for(var i = 3; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('lte', false, key, tree);
          var results = Array.from(it);
          var expected = sortedValues.slice(i);
          assert.strictEqual(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
          assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

          // #2: check intermediate keys that do not exist in the tree
          key--;
          if(i === 0) {
            assert.isTrue(iterateFrom('lte', false, key, tree).next().done);
          }
          else if(key !== expected[0]) {
            expected.unshift(sortedValues[i - 1]);
            it = iterateFrom('lte', false, key, tree);
            results = Array.from(it);
            assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
          }
        }
      });

      test('[reverse] iterates from the rightmost node that has a key that is less than or equal to the specified key', () => {
        for(var i = 3; i < sortedValues.length; i++) {
          // #1: check keys known to exist in the tree
          var key = sortedValues[i];
          var it = iterateFrom('lte', true, key, tree);
          if(i === 0) {
            assert.isTrue(it.next().done);
          }
          else {
            var results = Array.from(it);
            var expected = sortedValues.slice(0, i + 1).reverse();
            assert.strictEqual(results[0].key, expected[0], `i: ${i}, find: ${key}, found: ${results[0].key}, expected: ${expected[0]}`);
            assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);

            // #2: check intermediate keys that do not exist in the tree
            key--;
            if(i === 0) {
              assert.isTrue(iterateFrom('lte', true, key, tree).next().done);
            }
            else if(key !== expected[0]) {
              expected.shift();
              it = iterateFrom('lte', true, key, tree);
              results = Array.from(it);
              assert.deepEqual(results.map(n => n.key), expected, `i: ${i}, find: ${key}, found: ${results.length} results, expected: ${expected.length} results`);
            }
          }
        }
      });
    });
  });
});