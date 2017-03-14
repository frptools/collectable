import {assert} from 'chai';
import {size, isEmpty, isFrozen, fromArray, fromIterable, fromNativeMap, fromObject} from '../src';

suite('[Map]', () => {
  const pairs: [string, string][] = [['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd'], ['E', 'e']];

  suite('fromArray()', () => {
    test('returns an empty set if the array is empty', () => {
      assert.isTrue(isEmpty(fromArray([])));
    });

    test('returns a set containing each unique item in the array', () => {
      assert.sameDeepMembers(Array.from(fromArray(pairs)), pairs);
    });

    test('the returned set has size equal to the number of unique items in the array', () => {
      assert.strictEqual(size(fromArray(pairs)), pairs.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isFrozen(fromArray(pairs)));
    });
  });

  suite('fromIterable()', () => {
    let it: IterableIterator<[string, string]>;
    setup(() => {
      it = new Map(pairs).entries();
    });

    test('returns an empty set if the iterable is empty', () => {
      assert.isTrue(isEmpty(fromIterable(new Map().values())));
    });

    test('returns a set containing each unique item emitted by the iterable', () => {
      assert.sameDeepMembers(Array.from(fromIterable(it)), pairs);
    });

    test('the returned set has size equal to the number of unique items emitted by the iterable', () => {
      assert.strictEqual(size(fromIterable(it)), pairs.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isFrozen(fromIterable(it)));
    });
  });

  suite('fromNativeMap()', () => {
    const it = new Map(pairs);

    test('returns an empty set if the input set is empty', () => {
      assert.isTrue(isEmpty(fromNativeMap(new Map())));
    });

    test('returns a set containing the same items from the input set', () => {
      assert.sameDeepMembers(Array.from(fromNativeMap(it)), pairs);
    });

    test('the returned set has the same size as the input set', () => {
      assert.strictEqual(size(fromNativeMap(it)), pairs.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isFrozen(fromNativeMap(it)));
    });
  });

  suite('fromObject()', () => {
    const obj = pairs.reduce((o, [k, v]) => (o[k] = v, o), {});

    test('returns an empty set if the input set is empty', () => {
      assert.isTrue(isEmpty(fromObject({})));
    });

    test('returns a set containing the same items from the input set', () => {
      assert.sameDeepMembers(Array.from(fromObject(obj)), pairs);
    });

    test('the returned set has the same size as the input set', () => {
      assert.strictEqual(size(fromObject(obj)), pairs.length);
    });

    test('the returned set is frozen', () => {
      assert.isTrue(isFrozen(fromObject(obj)));
    });
  });
});