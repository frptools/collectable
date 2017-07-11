# [![Collectable.js: Immutable Map](https://github.com/frptools/collectable/raw/master/.assets/logo.png)](https://github.com/frptools/collectable)

# Immutable Map

> An persistent/immutable/functional map (dictionary) data structure

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/%40collectable%2Fmap.svg)](http://badge.fury.io/js/%40collectable%2Fmap)
[![GitHub version](https://badge.fury.io/gh/frptools%2Fcollectable.svg)](https://badge.fury.io/gh/frptools%2Fcollectable)
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/FRPTools/Lobby)

 A Clojure-style hash array mapped trie, adapted from [Tylor Steinberger](https://github.com/TylorS)'s [TypeScript conversion](https://github.com/TylorS/typed-hashmap) of [Matt Bierner's HAMT](https://github.com/mattbierner/hamt_plus) implementation.

*This documentation is under construction. The list of functions, descriptions and examples are pending.*

## Installation

```bash
# via NPM
npm install --save @collectable/map

# or Yarn
yarn add @collectable/map
```

If you intend to use other data structures as well, install the main collectable package instead. It takes a dependency on each of these data structures, and so they will become available implicitly, after installation.

```bash
# via NPM
npm install --save collectable

# or Yarn
yarn add collectable
```

TypeScript type definitions are included by default.

## Usage

Import and use the functions you need:

```js
import {fromObject, unwrap} from '@collectable/map';

const map = fromObject({foo: 'bar'}); // => <{foo: 'bar'}>
const pojo = unwrap(list); // => {foo: 'bar'}
```

Use a modern bundler such as Webpack 2 or Rollup in order to take advantage of tree shaking capabilities, giving you maximum flexbility to use what you need while excluding anything else from the final build.

## API

All map-manipulation functions are available from module `@collectable/map`.

----

*Documentation pending*