import {isMutable} from './ownership';
import {isDefined} from './functions';
import {PCGRandom} from './random';
import {PersistentStructure} from './collection';

export function hash(arg: any): number {
  if(isZero(arg)) return 0;
  if(typeof arg.valueOf === 'function' && arg.valueOf !== Object.prototype.valueOf) {
    arg = arg.valueOf();
    if(isZero(arg)) return 0;
  }
  switch(typeof arg) {
    case 'number': return hashNumber(arg);
    case 'string': return hashString(arg);
    case 'function': return hashMiscRef(arg);
    case 'object': return hashObject(arg);
    case 'boolean': return arg === true ? 1 : 0;
    default: return 0;
  }
}

function isZero(value: any): boolean {
  return value === null || value === void 0 || value === false;
}

const OBJECT_HASH = {
  pcg: new PCGRandom(13),
  map: new WeakMap<Object, number>()
};

function randomInt() {
  return OBJECT_HASH.pcg.integer(0x7FFFFFFF);
}

export function hashArray(arr: any[]): number {
  var h = 5381;
  for(var i = 0; i < arr.length; i++) {
    h = combineHash(h, hash(arr[i]));
  }
  return opt(h);
}

export function hashArgs(...args: any[]): number;
export function hashArgs(): number {
  var h = 5381;
  for(var i = 0; i < arguments.length; i++) {
    h = combineHash(h, hash(arguments[i]));
  }
  return opt(h);
}

export function hashPersistentStructure(c: PersistentStructure): number {
  var type = c['@@type'];
  if(isMutable(type.owner(c))) {
    return type.hash(c);
  }
  var cache = OBJECT_HASH;
  var h = cache.map.get(c);
  if(isDefined(h)) return h;
  h = type.hash(c);
  cache.map.set(c, h);
  return h;
}

export function combineHash(a: number, b: number): number {
  return (a * 33) ^ b;
}

export function hashObject(o: Object): number {
  var cache = OBJECT_HASH;
  var h = cache.map.get(o);
  if(isDefined(h)) return h;

  if(Array.isArray(o)) {
    h = hashArray(o);
  }
  else if('@@type' in o) {
    h = hashPersistentStructure(<PersistentStructure>o);
  }
  else if(o.constructor === Object) {
    h = hashPlainObject(o);
  }
  else {
    h = opt(randomInt());
  }

  cache.map.set(o, h);
  return h;
}

export function hashMiscRef(o: Object): number {
  var cache = OBJECT_HASH;
  var h = cache.map.get(o);
  if(isDefined(h)) return h;
  h = opt(randomInt());
  cache.map.set(o, h);
  return h;
}

export function hashIterator(it: Iterator<any>): number {
  var h = 5381;
  var current: IteratorResult<any>;
  while(!(current = it.next()).done) {
    h = combineHash(h, hash(current.value));
  }
  h = opt(h);
  return h;
}

export function hashPlainObject(o: Object): number {
  OBJECT_HASH.map.set(o, randomInt());
  var keys = Object.keys(o);
  var h = 5381;
  for(var i = 0; i < keys.length; i++) {
    h = combineHash(h, hashString(keys[i]));
    h = combineHash(h, hash(o[keys[i]]));
  }
  h = opt(h);
  return h;
}

export function hashNumber(n: number): number {
  if(n !== n || n === Infinity) return 0;
  var h = n | 0;
  if(h !== n) h ^= n * 0xFFFFFFFF;
  while(n > 0xFFFFFFFF) h ^= (n /= 0xFFFFFFFF);
  return opt(n);
}

export function hashString(str: string): number {
  var h = 5381, i = str.length;
  while(i) h = (h * 33) ^ str.charCodeAt(--i);
  return opt(h);
}

function opt(n: number) {
  return (n & 0xbfffffff) | ((n >>> 1) & 0x40000000);
}