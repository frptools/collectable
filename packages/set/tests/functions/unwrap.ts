import test from 'ava';
import { unwrap } from '@collectable/core';
import { HashMap, fromObject } from '@collectable/map';
import { HashSetStructure, empty, fromArray } from '../../src';

const values = ['A', 'B', 'C', 'D', 'E'];
let set1: HashSetStructure<string>, set2: HashSetStructure<any>;
let map1: HashMap.Instance<any, any>, map2: HashMap.Instance<any, any>;
test.before(() => {
  map1 = fromObject(values);
  map2 = fromObject(values);
  set1 = fromArray(values);
  set2 = fromArray([map1, map2]);
});

test('returns an empty array if the set is empty', t => {
  t.is(unwrap<any[]>(empty<string>()).length, 0);
});

test('returns an array containing each member of the input set', t => {
  t.deepEqual(unwrap<any[]>(set1).sort(), values);
});

test('the returned array includes recursively-unwrapped child collections', t => {
  const [a, b] = unwrap<any[]>(set2);
  const [c, d] = [unwrap(map1), unwrap(map2)];
  t.log(JSON.stringify(a));
  t.deepEqual(a, c);
  t.deepEqual(b, d);
});
