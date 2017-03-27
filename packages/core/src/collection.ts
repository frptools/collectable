export interface PersistentStructureTypeInfo {
  readonly type: symbol;
  owner(collection: any): number;
  group(collection: any): number;
  equals(other: any, collection: any): boolean;
  hash(collection: any): number;
  unwrap(collection: any): any;
}

export interface CollectionTypeInfo extends PersistentStructureTypeInfo {
  readonly indexable: boolean;
}

export interface IndexableCollectionTypeInfo extends CollectionTypeInfo {
  get(key: any, collection: any): any;
  has(key: any, collection: any): boolean;
  set(key: any, value: any, collection: any): any;
  update(key: any, updater: (value) => any, collection: any): any;
  verifyKey(key: any, collection: any): boolean;
}

export interface PersistentStructure {
  readonly '@@type': PersistentStructureTypeInfo;
}

export interface Collection<T> extends PersistentStructure {
  readonly '@@type': CollectionTypeInfo;
  [Symbol.iterator](): IterableIterator<T>;
}

export function isPersistentStructure(value: any): value is PersistentStructure {
  return value && typeof value === 'object' && '@@type' in value;
}

export function isCollection<T>(value: any): value is Collection<T> {
  return isPersistentStructure(value) && 'indexable' in value['@@type'];
}

export function isEqual(a: any, b: any) {
  if(a === b) return true;
  if(!isPersistentStructure(a) || !isPersistentStructure(b) || a['@@type'] !== b['@@type']) return false;
  const type = a['@@type'];
  return type.equals(a, b);
}

const CIRCULARS = new WeakMap<any, any>();
export function preventCircularRefs<T, U extends PersistentStructure>(createTarget: (source: U) => T, unwrap: (source: U, target: T) => T, source: U): T {
  if(CIRCULARS.has(source)) {
    return CIRCULARS.get(source);
  }
  var target = createTarget(source);
  CIRCULARS.set(source, target);
  var value = unwrap(source, target);
  CIRCULARS.delete(source);
  return value;
}

export function unwrapAny(value: any): any {
  return isPersistentStructure(value) ? value['@@type'].unwrap(value) : value;
}

export function getGroup<T>(collection: Collection<T>): number {
  return collection['@@type'].group(collection);
}

export function getOwner<T>(collection: Collection<T>): number {
  return collection['@@type'].owner(collection);
}
