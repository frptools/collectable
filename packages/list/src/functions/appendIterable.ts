import { ListStructure } from '../internals';
import { appendArray } from './appendArray';

/**
 * Appends a set of values to the end of a list, growing the size of the list by the number of
 * elements iterated over.
 *
 * @template T - The type of value contained by the list
 * @param value - The values to append to the list
 * @param list - The list to which the values should be appended
 * @returns A list containing the appended values
 */
export function appendIterable<T> (values: Iterable<T>, list: ListStructure<T>): ListStructure<T> {
  return appendArray(Array.from(values), list);
}
