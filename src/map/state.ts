import {nextId, batch} from '../shared/ownership';

export class MapState<K, V> {
  constructor(
    public values: Map<K, V>,
    public owner: number,
    public group: number
  ) {}
}

export function cloneState<K, V>(state: MapState<K, V>, mutable = false): MapState<K, V> {
  return {
    values: new Map<K, V>(state.values),
    owner: mutable ? batch.owner || -1 : 0,
    group: nextId()
  };
}

export function createState<K, V>(): MapState<K, V> {
  return new MapState<K, V>(
    new Map<K, V>(),
    nextId(),
    batch.owner
  );
}

export function emptyState<K, V>(): MapState<K, V> {
  return _empty;
}

const _empty = createState<any, any>();