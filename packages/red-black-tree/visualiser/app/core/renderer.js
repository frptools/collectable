import {writeLogs} from './console';
import {render} from '../data';

function mapState({index, model, versions}) {
  if(versions.size === 0) return void 0;
  const current = versions.get(index);
  return Object.assign({index}, current);
}

export function Renderer({dom, state$}) {
  const view$ = state$
    .map(mapState)
    .filter(x => x)
    .skipRepeatsWith((a, b) => a.index === b.index && a.model === b.model)
    .map(state => {
      writeLogs(state);
      return render(state);
    });
  return {view$};
}