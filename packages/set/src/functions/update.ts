import {HashSet, HashSetImpl} from '../internals';

export type UpdateSetCallback<T> = (set: HashSet<T>) => HashSet<T>|void;

export function update<T>(callback: UpdateSetCallback<T>, set: HashSet<T>): HashSet<T>;
export function update<T>(callback: UpdateSetCallback<T>, set: HashSetImpl<T>): HashSetImpl<T> {
  throw new Error('Not implemented');
}
