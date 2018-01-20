import test from 'ava';
import { unwrap } from '@collectable/core';
import { append, empty, get, prepend } from '../../src';
import { BRANCH_FACTOR } from '../helpers';

const m = BRANCH_FACTOR*BRANCH_FACTOR*(BRANCH_FACTOR + 2);

test(`(append(1) + get(n/2)) x ${m >>> 1}`, t => {
  var list = empty<number>();
  var values: number[] = [];
  for(var i = 0; i < m; i++) {
    list = append(i, list);
    values.push(i);
    var index = values.length >>> 1;
    t.is(get(index, list), values[index]);
  }
  t.deepEqual(unwrap(list), values);
});

test(`(append(1) + prepend(1)) x ${m >>> 1}`, t => {
  var list = empty<string>();
  var values: string[] = [];
  for(var i = 0; i < m; i++) {
    list = append(i.toString(), list);
    values.push((i++).toString());
    list = prepend(i.toString(), list);
    values.unshift(i.toString());
  }
  t.deepEqual(unwrap(list), values);
});

test(`(append(1) + prepend(1) + (get(mid) x 2)) x ${m >>> 1}`, t => {
  var list = empty<string>();
  var values: string[] = [];
  var offset = BRANCH_FACTOR + (BRANCH_FACTOR >>> 2);
  for(var i = 0; i < m; i++) {
    var value = `+${i+1}`;
    list = append(value, list);
    values.push(value);
    value = `-${(++i)+1}`;
    list = prepend(value, list);
    values.unshift(value);
    if(offset + 1 < list._size) {
      t.is(get(offset, list), values[offset], `get(${offset}), size:${list._size}`);
      t.is(get(-offset, list), values[values.length - offset], `get(${-offset}), size:${list._size}`);
    }
  }
  t.deepEqual(unwrap(list), values);
});

test(`(append(1) + prepend(1) + get(mid)) x ${m >>> 1}`, t => {
  var list = empty<string>();
  var values: string[] = [];
  var offset = BRANCH_FACTOR + (BRANCH_FACTOR >>> 2);
  for(var i = 0; i < m; i++) {
    var value = `+${i+1}`;
    list = append(value, list);
    values.push(value);
    var rightExpected = values[values.length - offset];
    var rightActual = get(-offset, list);
    value = `-${(++i)+1}`;
    list = prepend(value, list);
    values.unshift(value);
    var leftExpected = values[offset];
    var leftActual = get(offset, list);
    if(offset + 1 < list._size) {
      t.is(rightActual, rightExpected, `get(${offset}), size:${list._size}`);
      t.is(leftActual, leftExpected, `get(${-offset}), size:${list._size}`);
    }
  }
  t.deepEqual(unwrap(list), values);
});