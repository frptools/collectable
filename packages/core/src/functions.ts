export function isDefined<T>(value: T|undefined): value is T {
  return value !== void 0;
}

export function isUndefined<T>(value: T|undefined): value is undefined {
  return value === void 0;
}

export function abs(value: number): number {
  return value < 0 ? -value : value;
}

export function min(a: number, b: number): number {
  return a <= b ? a : b;
}

export function max(a: number, b: number): number {
  return a >= b ? a : b;
}
