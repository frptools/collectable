import {assert} from 'chai';
import {modify, isMutable, isImmutable} from '@collectable/core';
import {ListStructure, map, size, fromArray} from '../../src';

const toLower = (a: string) => a.toLowerCase();

suite('[List]', () => {
  suite('map()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];

    suite('if the input list is mutable', () => {
      let list: ListStructure<string>;
      setup(() => {
        list = modify(fromArray(values));
      });

      test('the input list is returned', () => {
        assert.strictEqual(map(toLower, list), list);
      });

      test('the input list is still mutable', () => {
        map(toLower, list);
        assert.isTrue(isMutable(list));
      });

      test('the list size remains unchanged', () => {
        assert.strictEqual(size(map(toLower, list)), values.length);
      });

      test('the predicate is called for each member of the input list', () => {
        let each: string[] = [];
        map(c => (each.push(c), c), list);
        assert.sameMembers(each, values);
      });

      test('all members of list set are replaced by their transformed counterpart returned by the predicate', () => {
        assert.sameMembers(Array.from(map(toLower, list)), values.map(toLower));
      });
    });

    suite('if the input list is immutable', () => {
      let list0: ListStructure<string>, list1: ListStructure<string>;
      setup(() => {
        list0 = fromArray(values);
        list1 = map(toLower, list0);
      });

      test('the input list is not modified', () => {
        assert.strictEqual(size(list0), values.length);
        assert.isTrue(isImmutable(list0));
        assert.sameMembers(Array.from(list0), values);
      });

      test('a new immutable list is returned', () => {
        assert.isTrue(isImmutable(list1));
        assert.notStrictEqual(list0, list1);
      });

      test('the size of the new list equals that of the input list', () => {
        assert.strictEqual(size(list0), size(list1));
      });

      test('the predicate is called for each member of the input list', () => {
        let each: string[] = [];
        map(c => (each.push(c), c), list0);
        assert.sameMembers(each, values);
      });

      test('the new list is populated by the predicate-transformed counterparts of each member of the input list', () => {
        assert.sameMembers(Array.from(map(toLower, list1)), values.map(toLower));
      });
    });
  });
});