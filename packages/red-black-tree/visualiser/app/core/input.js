import {fromEvent} from 'most';

const storageKey = 'collectable-visualiser-rbtree-';

export function saveValue(key, value) {
  localStorage.setItem(`${storageKey}-${key}`, value.toString());
  console.log(`${key} (${value}) saved.`);
}

export function getSavedValue(key, defaultValue = 0) {
  var value = localStorage.getItem(`${storageKey}-${key}`);
  // console.log(`saved value for ${`${storageKey}-${key}`} is ${value}.`);
  return value ? parseInt(value) : defaultValue;
}

function updateAlignment(state, delta) {
  if(isNaN(state.alignment)) state.alignment = 0;
  state.alignment = Math.min(2, Math.max(0, delta + state.alignment));
  saveValue('alignment', state.alignment);
}

export function Input({dom}) {
  const selectVersion$ = dom
    .select('.link')
    .events('click')
    .map(ev => parseInt(ev.target.dataset.index))
    .map(i => state => state.index = i);

  const key$ = fromEvent('keydown', window)
    .map((ev = {which: 0}) => {
      var fn;
      // console.log(ev);
      switch(ev.which) {
        /* home */
        case 36:
          fn = state => {
            state.index = 0;
          };
          break;

        /* end */
        case 35:
          fn = state => {
            state.index = state.versions.size - 1;
          };
          break;

        /* left */
        case 37:
          fn = state => {
            if(state.index > 0) state.index--;
          };
          break;

        /* right */
        case 39:
          fn = state => {
            if(state.index + 1 < state.versions.size) state.index++;
          };
          break;

        /* + */
        case 107:
          fn = state => {
            if(state.zoom < 1) state.zoom = Math.min(1, state.zoom + 0.1);
          };
          break;

        /* - */
        case 109:
          fn = state => {
            if(state.zoom > 0.1) state.zoom = Math.max(0.1, Math.round((state.zoom - 0.1)*10)/10);
          };
          break;

        /* [ */
        case 219:
          fn = state => {
            updateAlignment(state, -1);
          };
          break;

        /* ] */
        case 221:
          fn = state => {
            updateAlignment(state, 1);
          };
          break;

        /* s */
        case 83:
          fn = state => {
            saveValue('index', state.index);
            // saveValue('zoom', state.zoom);
          };
          break;

        /* x */
        case 88:
          console.clear();
          fn = null;
          break;

        /* pgup */
        case 33:
          fn = state => {
            for(var i = state.index - 1; i >= 0; i--) {
              if(state.versions.get(i).done) return (state.index = i);
            }
            return (state.index = 0);
          };
          break;

        /* pgdn */
        case 34:
          fn = state => {
            for(var i = state.index + 1; i < state.versions.size; i++) {
              if(state.versions.get(i).done) return (state.index = i);
            }
            return (state.index = state.versions.size - 1);
          };
          break;

        default:
          /*console.log(ev.which);*/
          return null;
      }
      ev => ev.preventDefault();
      return fn;
    })
    .filter(fn => fn);

  const ignore$ = dom.select('body')
    .events('keydown')
    .tap(ev => {
      switch(ev.which) {
        case 33: /* pgup */
        case 34: /* pgdn */
        case 36: /* home */
        case 35: /* end */
        case 37: /* left */
        case 39: /* right */
          ev.preventDefault();
          break;
      }
    })
    .filter(() => false);

  const action$ = key$
    .merge(selectVersion$, ignore$)
    .multicast();

  return {action$};
}