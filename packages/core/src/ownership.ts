var _nextId = 0;
export function nextId() {
  return ++_nextId;
}

var _owner = 0, _depth = 0;
export interface Batch {
  (callback: (owner?: number) => void): any;
  <T>(callback: (owner?: number) => void): T;
  start(): void;
  end(): boolean;
  owner(ensureMutable: boolean): number;
  readonly active: boolean;
}

function start(): void {
  if(_depth === 0) {
    _owner = nextId();
  }
  _depth++;
}

function end(): boolean {
  if(_depth > 0) {
    if(--_depth > 0) {
      return false;
    }
    _owner = 0;
  }
  return true;
}

function owner(ensureMutable: true): number {
  return ensureMutable ? _owner || -1 : _owner;
}

export const batch: Batch = <any>Object.assign(
  function(callback: (owner?: number) => any): any {
    start();
    var result = callback(_owner);
    end();
    return result;
  },
  {
    start,
    end,
    owner
  }
);
Object.defineProperties(batch, {
  active: {
    get(): boolean {
      return _owner !== 0;
    }
  }
});

export function isMutable(owner: number): boolean {
  return owner === -1 || (owner !== 0 && owner === _owner);
}

export function isImmutable(owner: number): boolean {
  return owner === 0 || (owner !== -1 && owner !== _owner);
}
