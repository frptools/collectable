import {MappingFunction} from './types';

export function copyArray<T>(values: T[]): T[] {
  if(values.length > 7) {
    var arr = new Array<T>(values.length);
    for(var i = 0; i < values.length; i++) {
      arr[i] = values[i];
    }
    return arr;
  }
  switch(values.length) {
    case 0: return [];
    case 1:  return [values[0]];
    case 2:  return [values[0], values[1]];
    case 3:  return [values[0], values[1], values[2]];
    case 4:  return [values[0], values[1], values[2], values[3]];
    case 5:  return [values[0], values[1], values[2], values[3], values[4]];
    case 6:  return [values[0], values[1], values[2], values[3], values[4], values[5]];
    case 7:  return [values[0], values[1], values[2], values[3], values[4], values[5], values[6]];
    default: return values.slice(); // never reached, but seems to trigger optimization in V8 for some reason
  }
}

export function concatArray<T>(left: T[], right: T[]): T[] {
  var arr = new Array<T>(left.length + right.length);
  for(var i = 0; i < left.length; i++) {
    arr[i] = left[i];
  }
  for(var j = 0; j < right.length; i++, j++) {
    arr[i] = right[j];
  }
  return arr;
}

export function replaceArrayElement<T>(index: number, value: T, array: T[]): T[] {
  var length = array.length;
  var newArray = Array<T>(length);

  for(var i = 0; i < length; ++i) {
    newArray[i] = array[i];
  }

  newArray[index] = value;
  return newArray;
}

export function removeArrayElement<T>(index: number, array: T[]): T[] {
  var length = array.length;

  if(length === 0 || index >= length) return array;
  if(length === 1) return [];

  var newArray = Array<T>(length - 1);

  for(var i = 0; i < index; ++i) {
    newArray[i] = array[i];
  }
  for(i = i + 1; i < length; ++i) {
    newArray[i - 1] = array[i];
  }

  return newArray;
}

export function insertArrayElement<T>(index: number, value: T, array: T[]): T[] {
  var length = array.length;
  var newArray = Array<T>(length + 1);

  for(var i = 0; i < index; ++i) {
    newArray[i] = array[i];
  }

  newArray[i++] = value;

  for(; i < length + 1; ++i) {
    newArray[i] = array[i - 1];
  }

  return newArray;
}


export function blockCopyMapped<T, U>(mapper: MappingFunction<T, U>, sourceValues: T[], targetValues: U[], sourceIndex: number, targetIndex: number, count: number): void {
  if(sourceValues === <any>targetValues && sourceIndex < targetIndex) {
    for(var i = sourceIndex + count - 1, j = targetIndex + count - 1, c = 0; c < count; i--, j--, c++) {
      targetValues[j] = mapper(sourceValues[i], j);
    }
  }
  else {
    for(var i = sourceIndex, j = targetIndex, c = 0; c < count; i++, j++, c++) {
      targetValues[j] = mapper(sourceValues[i], j);
    }
  }
}

export function blockCopy<T>(sourceValues: T[], targetValues: T[], sourceIndex: number, targetIndex: number, count: number): void {
  if(sourceValues === targetValues && sourceIndex < targetIndex) {
    for(var i = sourceIndex + count - 1, j = targetIndex + count - 1, c = 0; c < count; i--, j--, c++) {
      targetValues[j] = sourceValues[i];
    }
  }
  else {
    for(var i = sourceIndex, j = targetIndex, c = 0; c < count; i++, j++, c++) {
      targetValues[j] = sourceValues[i];
    }
  }
}

export function truncateLeft<T>(values: T[], start: number): T[] {
  var array = new Array<T>(values.length - start);
  for(var i = 0, j = start; j < values.length; i++, j++) {
    array[i] = values[j];
  }
  return array;
}