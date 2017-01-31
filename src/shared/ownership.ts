import {log} from '../list/debug'; // ## DEBUG ONLY

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
  readonly active: boolean;
  readonly owner: number;
}

function start(): void {
  if(_depth === 0) {
    _owner = nextId();
    log(`initialize batch ${_owner}`); // ## DEBUG ONLY
  }
  else {
    log(`enter batch ${_owner}, depth: ${_depth + 1}`); // ## DEBUG ONLY
  }
  _depth++;
}

function end(): boolean {
  if(_depth > 0) {
    if(--_depth > 0) {
      log(`exit batch ${_owner}, depth: ${_depth}`); // ## DEBUG ONLY
      return false;
    }
    log(`conclude batch ${_owner}`); // ## DEBUG ONLY
    _owner = 0;
  }
  return true;
}

export const batch: Batch = <any>Object.assign(
  function (callback: (owner?: number) => any): any {
    start();
    var result = callback(_owner);
    end();
    return result;
  },
  {
    start,
    end
  }
);
Object.defineProperties(batch, {
  active: {
    get(): boolean {
      return _owner !== 0;
    }
  },
  owner: {
    get(): number {
      return _owner;
    }
  }
});

export function isMutable(owner: number): boolean {
  log(`[isMutable] owner: ${owner}, _owner: ${_owner}`); // ## DEBUG ONLY
  return owner === -1 || (owner !== 0 && owner === _owner);
}