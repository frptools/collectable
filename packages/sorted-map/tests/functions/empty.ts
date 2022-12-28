import test from 'ava';
import { ComparatorFn, numericCompare } from '@frptools/corelib';
import { empty, set, size, SortedMapEntry, firstValue, lastValue } from '../../src';

interface Item {
  id: number;
  time: number;
}

test('returns a map with size 0', t => {
  t.is(size(empty()), 0);
});

test('always returns the same set instance if called with no arguments', t => {
  const a = empty(), b = empty();
  t.is(a, b);
});

test('sorts added items', t => {
  const compare: ComparatorFn<SortedMapEntry<number, Item, number>> = (x, y) => numericCompare(x.view, y.view);
  const map = empty<number, Item, number>(true, compare, x => x.time);

  const now = new Date();
  for (let i = 0; i < 15; i++)   {
    const item = {
      id: (i + 1),
      time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i + 1)).valueOf()
    };

    set(item.id, item, map);
  }

  t.deepEqual(firstValue(map), {
    id: 15,
    time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15).valueOf()
  });

  t.deepEqual(lastValue(map), {
    id: 1,
    time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).valueOf()
  });
});
