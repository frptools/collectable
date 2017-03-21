import {assert} from 'chai';
import {map as _map, size, thaw, isThawed, isFrozen} from '../../src';
import {SortedMap, fromStringArray, pairsFrom} from '../test-utils';

const toLower = (v: number, k: string) => k.toLowerCase();

suite('[SortedMap]', () => {
  suite('map()', () => {
    const values = ['A', 'B', 'C', 'D', 'E'];

    suite('if the input map is mutable', () => {
      let map: SortedMap;
      setup(() => {
        map = thaw(fromStringArray(values));
      });

      test('the input map is returned', () => {
        assert.strictEqual(_map(toLower, map), map);
      });

      test('the input map is still mutable', () => {
        _map(toLower, map);
        assert.isTrue(isThawed(map));
      });

      test('the map size remains unchanged', () => {
        assert.strictEqual(size(_map(toLower, map)), values.length);
      });

      test('the predicate is called for each member of the input map', () => {
        let each: string[] = [];
        _map((v, k) => (each.push(k), v), map);
        assert.deepEqual(each, values);
      });

      test('all members of the map are replaced by their transformed counterpart returned by the predicate', () => {
        assert.deepEqual(Array.from(_map(toLower, map)), values.map(v => [v, v.toLowerCase()]));
      });
    });

    suite('if the input map is immutable', () => {
      let map0: SortedMap, map1: SortedMap;
      setup(() => {
        map0 = fromStringArray(values);
        map1 = _map(toLower, map0);
      });

      test('the input map is not modified', () => {
        assert.strictEqual(size(map0), values.length);
        assert.isTrue(isFrozen(map0));
        assert.deepEqual(Array.from(map0), pairsFrom(values));
      });

      test('a new immutable map is returned', () => {
        assert.isTrue(isFrozen(map1));
        assert.notStrictEqual(map0, map1);
      });

      test('the size of the new map equals that of the input map', () => {
        assert.strictEqual(size(map0), size(map1));
      });

      test('the predicate is called for each member of the input map', () => {
        let each: string[] = [];
        _map((v, k) => (each.push(k), v), map0);
        assert.deepEqual(each, values);
      });

      test('the new map is populated by the predicate-transformed counterparts of each member of the input map', () => {
        assert.deepEqual(Array.from(_map(toLower, map1)), values.map(v => [v, v.toLowerCase()]));
      });
    });
  });
});