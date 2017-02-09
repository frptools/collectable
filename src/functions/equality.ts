import {isCollection} from '@collectable/core';

export function isEqual(a: any, b: any) {
  if(a === b) return true;
  if(!isCollection<any>(a) || !isCollection<any>(b) || a['@@type'] !== b['@@type']) return false;
  return a.equals(b);
}
