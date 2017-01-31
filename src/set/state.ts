import {nextId, batch} from '../shared/ownership';
import {isDefined} from '../shared/functions';

export class SetState<T> {
  constructor(
    public values: Set<T>,
    public owner: number,
    public group: number
  ) {}
}

export function cloneState<T>(state: SetState<T>, mutable = false): SetState<T> {
  return {
    values: new Set<T>(state.values),
    owner: mutable ? batch.owner || -1 : 0,
    group: nextId()
  };
}

export function createState<T>(values?: T[]|Iterable<T>): SetState<T> {
  return new SetState<T>(
    isDefined(values) ? new Set<T>(values) : new Set<T>(),
    nextId(),
    batch.owner
  );
}

export function emptyState<T>(): SetState<T> {
  return _empty;
}

const _empty = createState<any>();