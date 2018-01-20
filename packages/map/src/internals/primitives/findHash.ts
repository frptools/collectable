import { stringHash } from '../common';

export function findHash (key: any): number {
  const hash: number = typeof key === 'number'
    ? key
    : typeof key === 'string'
      ? stringHash(key)
      : Math.abs(stringHash(JSON.stringify(key)));

  return hash;
}
