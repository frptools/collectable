/**
 * Immutable replacement of a value at a given index
 */
export function replace<T>(index: number, value: T, array: Array<T>): Array<T> {
  const length = array.length;
  const newArray = Array(length);

  for(let i = 0; i < length; ++i) {
    newArray[i] = array[i];
  }

  newArray[index] = value;

  return newArray;
}

/**
 * Immutable removal of a value at given index
 */
export function remove<T>(index: number, array: Array<T>): Array<T> {
  const length = array.length;

  if(length === 0 || index >= length) return array;

  if(length === 1) return [];

  const newArray = Array(length - 1);

  let i = 0;

  for(; i < index; ++i) {
    newArray[i] = array[i];
  }

  for(i = i + 1; i < length; ++i) {
    newArray[i - 1] = array[i];
  }

  return newArray;
}

/**
 * Immutable insertion of a value at a given index
 */
export function insert<T>(index: number, value: T, array: Array<T>): Array<T> {
  const length = array.length;
  const newArray = Array(length - 1);

  let i = 0;

  for(; i < index; ++i) {
    newArray[i] = array[i];
  }

  newArray[i++] = value;

  for(; i < length; ++i) {
    newArray[i] = array[i - 1];
  }

  return newArray;
}
