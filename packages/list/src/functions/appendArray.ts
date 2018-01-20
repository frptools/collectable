import { commit, modify } from '@collectable/core';
import { ListStructure, appendValues } from '../internals';

/**
 * Appends an array of values to the end of a list, growing the size of the list by the number of
 * elements in the array.
 *
 * @template T - The type of value contained by the list
 * @param value - The values to append to the list
 * @param list - The list to which the values should be appended
 * @returns A list containing the appended values
 */
export function appendArray<T> (values: T[], list: ListStructure<T>): ListStructure<T> {
  if(values.length === 0) return list;
  list = modify(list);
  appendValues(list, values);
  return commit(list);
}
