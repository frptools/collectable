# Collectable.js: General API

The general API provides methods to work with deeply-nested combinations of different Collectable.js data structures.

*This documentation is under construction. The list of functions, descriptions and examples are pending.*

## Usage

To combine multiple data structures effectively, import universal methods from the main package and collection-specific methods from other relevant packages as needed:

```js
import {fromObject, updateIn, setIn} from 'collectable';
import {append} from '@collectable/list/curried';

const input = {
  foo: 'abc',
  xyz: [3, [5, 6], 7, 9]
};
const map0 = fromObject(input); // <{foo: 'abc', xyz: <[3, [5, 6], 7, 9]>}>
const map1 = updateIn(['xyz', 1, 0], n => 4, map0); // <{foo: 'abc', xyz: <[3, [4, 6], 7, 9]>}>
const map2 = setIn(['foo', 'bar'], x => 'baz', map1); // <{foo: <{bar: 'baz'}>, xyz: ...>
const map3 = updateIn(['xyz', 1], append(42)); // <{..., xyz: <[3, [5, 6, 42], 7, 9]>}>
```

Use a modern bundler such as Webpack 2 or Rollup in order to take advantage of tree shaking capabilities, giving you maximum flexbility to take the whole package as a dependency while excluding anything you don't use from the final build.

## API

All collection-manipulation functions are available from module `collectable`.

Curried versions of each of these (where applicable) are available from module `collectable/curried`. The curried versions of each function will suffer a minor performance hit due to the additional layers of indirection required to provide a curried interface. In most cases this is not worth worrying about, but if maximum performance is desired, consider using the non-curried API instead.

----

*Documentation pending*