export interface Iterable<T> {
  [Symbol.iterator](): IterableIterator<T|undefined>;
  toJS(): any;
}

export function isIterable<T>(value: any): value is Iterable<T> {
  return value && typeof value === 'object' && 'toJS' in value;
}