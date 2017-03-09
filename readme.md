# [![Collectable.js](.assets/logo.png)](https://github.com/frptools/collectable)

An all-you-can-eat buffet of high-performance, immutable/persistent data structures.

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/collectable.svg)](http://badge.fury.io/js/collectable)
[![GitHub version](https://badge.fury.io/gh/frptools%2Fcollectable.svg)](https://badge.fury.io/gh/frptools%2Fcollectable)
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/FRPTools/Lobby)

## Available Data Structures

- [ **[List](/packages/list#collectablejs-immutable-list)** ] A persistent vector structure based on a modified [RRB Tree](https://infoscience.epfl.ch/record/169879/files/RMTrees.pdf) implementation, with very fast concatenation, insertion and deletion of ranges of values, etc.
- [ **[Map](/packages/map#collectablejs-immutable-map)** ] A Clojure-style hash-array-mapped trie, adapted by [TylorS](https://github.com/TylorS) from [Matt Bierner's HAMT](https://github.com/mattbierner/hamt_plus) implementation.  
  *Note: stopgap ES6 Map-backed implementation currently in place, to be replaced shortly.*
- [ **[Set](/packages/set#collectablejs-immutable-set)** ] A persistent set implementation, backed by our own immutable map structure.  
  *Note: stopgap ES6 Set-backed implementation currently in place, to be replaced shortly.*
- [ **[Red Black Tree](/packages/red-black-tree#immutable-red-black-tree)** ] A persistent red/black tree structure, typically intended to be used as a backing structure for other data structures.
- [More to come...](/wiki)

Want to help out? See [the guide for contributors](CONTRIBUTING.md).

## Installation

```
# via NPM
npm install --save collectable

# or Yarn
yarn add collectable
```

TypeScript type definitions are included by default.

## Usage

**API Reference:**
[ [General](/docs/index.md#collectablejs-general-api)
| [List](/packages/list/README.md#collectablejs-immutable-list)
| [Map](/packages/map/README.md#collectablejs-immutable-map)
| [Set](/packages/set/README.md#collectablejs-immutable-set)
| [Red Black Tree](/packages/red-black-tree/README.md#immutable-red-black-tree)
| [Others...](/wiki) ]

Individual data structures are pulled in automatically as dependencies of the main package. By having your project take a dependency on `collectable` itself, all data structures are made available implicitly as scoped imports, and operations on deeply-nested data structures are available via the main package.

For example, to use an immutable list:

```js
import {fromArray, unwrap} from '@collectable/list';

const list = fromArray(['X', 'Y']);
const array = unwrap(list);
```

Pre-curried versions of functions for a given data structure are available by appending `/curried` to the import path, like so:

```ts
import {fromArray, append} from '@collectable/list/curried';

const two = fromArray(['X', 'Y']); // => [X, Y]
const addZ = append('Z');
const three = addZ(two); // => [X, Y, Z]
```

To combine multiple data structures effectively, import [universal methods](/docs/index.md) from the main package and collection-specific methods from other relevant packages as needed:

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