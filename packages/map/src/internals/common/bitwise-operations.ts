import {MASK} from './constants';

export function hammingWeight(num: number): number {
  num = num - ((num >> 1) & 0x55555555);
  num = (num & 0x33333333) + ((num >> 2) & 0x33333333);
  return ((num + (num >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

export function hashFragment (shift: number, hash: number) {
  return (hash >>> shift) & MASK;
}

export function toBitmap(num: number) {
  return 1 << num;
}

export function bitmapToIndex(shift: number, bitmap: number) {
  return hammingWeight(shift & (bitmap - 1));
}
