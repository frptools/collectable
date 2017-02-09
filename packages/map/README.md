# Collectable.js: Immutable Map

> An persistent hash map (dictionary) data structure

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/@collectable/map.svg)](http://badge.fury.io/js/@collectable/map)
[![GitHub version](https://badge.fury.io/gh/frptools%2Fcollectable.svg)](https://badge.fury.io/gh/frptools%2Fcollectable)

 A Clojure-style hash-array-mapped trie, adapted by [TylorS](https://github.com/TylorS) from [Matt Bierner's HAMT](https://github.com/mattbierner/hamt_plus) implementation.

*This documentation is under construction. The list of functions, descriptions and examples are pending.*

## Installation

```
# via NPM
npm install --save @collectable/map

# or Yarn
yarn add @collectable/map
```

If you intend to use other data structures as well, install the main collectable package instead. It takes a dependency on each of these data structures, and so they will become available implicitly, after installation.

```
# via NPM
npm install --save collectable

# or Yarn
yarn add collectable
```

TypeScript type definitions are included by default.

## Usage

Import and use the functions you need:

```js
import {fromObject, objectFrom} from '@collectable/map';

const map = fromObject({foo: 'bar'}); // => <{foo: 'bar'}>
const pojo = objectFrom(list); // => {foo: 'bar'}
```

Pre-curried versions of functions for a given data structure are available by appending `/curried` to the import path, like so:

```ts
import {empty, set} from '@collectable/map/curried';

const setFoo = set('foo');
const map = setFoo('bar', empty()); // => <{foo: 'bar'}>

const setFooBar = set('foo', 'bar');
const map = setFooBar(empty()); // => <{foo: 'bar'}>
```

Use a modern bundler such as Webpack 2 or Rollup in order to take advantage of tree shaking capabilities, giving you maximum flexbility to use what you need while excluding anything else from the final build.

## API

All map-manipulation functions are available from module `@collectable/map`.

Curried versions of each of these (where applicable) are available from module `@collectable/map/curried`. The curried versions of each function will suffer a minor performance hit due to the additional layers of indirection required to provide a curried interface. In most cases this is not worth worrying about, but if maximum performance is desired, consider using the non-curried API instead.

----

*Documentation pending*