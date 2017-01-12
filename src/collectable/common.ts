import {PList} from './list';
import {PMap} from './map';
import {PSet} from './set';

export function getIn(value: any, path: any[]): any {
  var i = 0;
  while(i < path.length && value !== void 0) {
    if(value instanceof PMap) {
      value = value.get(path[i]);
    }
    else if(value instanceof PList) {
      if(typeof path[i] === 'number') {
        value = value.get(path[i]);
      }
      else {
        value = void 0;
      }
    }
    i++;
  }
  return value;
}

export function hasIn(value: any, path: any[]): boolean {
  var i = 0;
  while(i < path.length && value !== void 0) {
    var value: any;
    if(value instanceof PMap) {
      if(!value.has(path[i])) {
        return false;
      }
      value = value.get(path[i]);
    }
    else if(value instanceof PList) {
      var index = path[i];
      if(typeof index !== 'number' || !value.hasIndex(index)) {
        return false;
      }
      value = value.get(path[i]);
    }
    else {
      if(i === path.length - 1) {
        if(value === path[i]) {
          return true;
        }
        if(value instanceof PSet) {
          return value.has(path[i]);
        }
      }
      return false;
    }
    i++;
  }
  return value;
}