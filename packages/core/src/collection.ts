export interface CollectionTypeInfo {
  readonly type: symbol;
  readonly indexable: boolean;
  equals(other: any, collection: any): boolean;
  unwrap(collection: any): any;
}

export interface IndexableCollectionTypeInfo extends CollectionTypeInfo {
  get(key: any, collection: any): any;
  has(key: any, collection: any): boolean;
  set(key: any, value: any, collection: any): any;
  update(key: any, updater: (value) => any, collection: any): any;
  verifyKey(key: any, collection: any): boolean;
}

export interface Collection<T> {
  readonly '@@type': CollectionTypeInfo;
  [Symbol.iterator](): IterableIterator<T | undefined>;
}

export function isCollection<T>(value: any): value is Collection<T> {
  return value && typeof value === 'object' && '@@type' in value && Symbol.iterator in value;
}

export function isEqual(a: any, b: any) {
  if(a === b) return true;
  if(!isCollection<any>(a) || !isCollection<any>(b) || a['@@type'] !== b['@@type']) return false;
  const type = a['@@type'];
  return type.equals(a, b);
}

const CIRCULARS = new WeakMap<any, any>();
export function preventCircularRefs<T, U, C extends Collection<U>>(createTarget: (collection: C) => T, unwrap: (collection: C, target: T) => T, collection: C): T {
  if(CIRCULARS.has(collection)) {
    return CIRCULARS.get(collection);
  }
  var target = createTarget(collection);
  CIRCULARS.set(collection, target);
  var value = unwrap(collection, target);
  CIRCULARS.delete(collection);
  return value;
}

export function unwrapAny(value: any): any {
  return isCollection<any>(value) ? value['@@type'].unwrap(value) : value;
}