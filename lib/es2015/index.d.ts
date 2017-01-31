export { batch } from './shared/ownership';
export { PersistentList } from './list';
export { PersistentMap } from './map/map';
export { PersistentSet } from './set/set';
import { PersistentList as List } from './list';
import { PersistentMap as Map } from './map';
import { PersistentSet as Set } from './set';
import { ListState } from './list';
import { MapState } from './map';
import { SetState } from './set';
export declare type CollectionState = ListState<any> | MapState<any, any> | SetState<any>;
export declare type DeepCollectionState = ListState<any> | MapState<any, any>;
declare var _default: {
    Map: typeof Map;
    Set: typeof Set;
    List: typeof List;
};
export default _default;
