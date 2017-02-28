import Immutable from 'immutable';
import CJ from 'circular-json';
import {create} from '@most/create';
import {isInstanceOfVisualisedType, createModel, setCallback} from '../data';

function addNext(add) {
  let last = null, ref = null, label = null, done = false, logs = [], log = [];

  setCallback((args) => {
    if(args.length === 0) {
      return;
    }

    function saveAndClear() {
      if(!ref) return;
      if(log.length) {
        logs.push(log);
        log = [];
      }
      add({
        ref,
        model: createModel(ref),
        done,
        label: label || `Collection size: ${ref._size}`,
        logs
      });
      ref = null;
      last = null;
      done = false;
      label = null;
      logs = [];
    }

    function addLog(arg) {
      if(isInstanceOfVisualisedType(arg)) {
        saveAndClear();
        ref = arg;
        last = 'instance';
        return;
      }
      else {
        log.push(arg && typeof arg === 'object' ? CJ.parse(CJ.stringify(arg)) : arg);
      }
    }

    for(let i = 0; i < args.length; i++) {
      let arg = args[i];
      switch(last) {
        case 'instance':
          switch(typeof arg) {
            case 'boolean':
              done = arg;
              last = 'done';
              break;

            case 'string':
              label = arg;
              saveAndClear();
              break;

            default:
              addLog(arg);
              break;
          }
          break;

        case 'done':
          if(typeof arg === 'string') {
            label = arg;
            saveAndClear();
          }
          else {
            saveAndClear();
            addLog(arg);
          }
          break;

        default:
          addLog(arg);
          break;
      }
    }

    if(log.length > 0) {
      logs.push(log);
      log = [];
    }

    saveAndClear();
  });
}

function appendToHistory(history, entry) {
  return history.push(entry);
}

export function VersionList(sources) {
  const versions$ = create(addNext)
    .scan(appendToHistory, Immutable.List())
    .multicast();
  return {
    versions$
  };
}
