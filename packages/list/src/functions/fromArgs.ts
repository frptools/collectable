import { ListStructure } from '../internals';
import { fromArray } from './fromArray';

export const fromArgs: <T>(...values: T[]) => ListStructure<T> = function () {
  return fromArray(Array.from(arguments));
};
