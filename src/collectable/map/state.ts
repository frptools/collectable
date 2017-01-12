import {nextId, batch} from '../shared/ownership';

export class PMapState<K, V> {
  constructor(
    public values: Map<K, V>,
    public owner: number,
    public group: number
  ) {}
}

export function cloneState<K, V>(state: PMapState<K, V>, mutable = false): PMapState<K, V> {
  return {
    values: new Map<K, V>(state.values),
    owner: mutable ? batch.owner || -1 : 0,
    group: nextId()
  };
}

export function createState<K, V>(): PMapState<K, V> {
  return new PMapState<K, V>(
    new Map<K, V>(),
    nextId(),
    batch.owner
  );
}

export function emptyState<K, V>(): PMapState<K, V> {
  return _empty;
}

const _empty = createState<any, any>();