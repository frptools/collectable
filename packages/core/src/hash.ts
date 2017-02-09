import {isDefined} from './functions';
import {PCGRandom} from './random';

export function hash(arg: any): number {
  if(isZero(arg)) return 0;
  if(typeof arg.valueOf === 'function' && arg.valueOf !== Object.prototype.valueOf) {
    arg = arg.valueOf();
    if(isZero(arg)) return 0;
  }
  switch(typeof arg) {
    case 'number': return hashNumber(arg);
    case 'string': return hashString(arg);
    case 'function':
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

function hashObject(o: Object): number {
  var cache = OBJECT_HASH;
  var n = cache.map.get(o);
  if(isDefined(n)) return n;
  n = cache.pcg.integer(0x7FFFFFFF);
  cache.map.set(o, n);
  return n;
}

function hashNumber(n): number {
  if(n !== n || n === Infinity) return 0;
  var h = n | 0;
  if (h !== n) {
    h ^= n * 0xFFFFFFFF;
  }
  while (n > 0xFFFFFFFF) {
    n /= 0xFFFFFFFF;
    h ^= n;
  }
  return opt(n);
}

function hashString(str: string): number {
  var h = 5381;
  for(var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    h = ((h << 5) + h) + c;
  }
  return opt(h);
}

function opt(n: number) {
  return (n & 0xbfffffff) & ((n >>> 1) & 0x40000000);
}