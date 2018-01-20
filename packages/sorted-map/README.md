# [![Collectable.js: Immutable Set](https://github.com/frptools/collectable/raw/master/.assets/logo.png)](https://github.com/frptools/collectable)

# Immutable Sorted Map

> An persistent sorted map data structure with user-definable sort order

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/%40collectable%2Fsorted-map.svg)](http://badge.fury.io/js/%40collectable%2Fsorted-map)

*This documentation is under construction. The list of functions, descriptions and examples are pending.*

## Installation

```bash
# via NPM
npm install @collectable/sorted-map

# or Yarn
yarn add @collectable/sorted-map
```

If you intend to use other data structures as well, install the main collectable package instead. It takes a dependency on each of these data structures, and so they will become available implicitly, after installation.

```bash
# via NPM
npm install collectable

# or Yarn
yarn add collectable
```

TypeScript type definitions are built in.

## Usage

Import and use the functions you need:

```js
import { fromObject, unwrap } from '@collectable/sorted-map';

const map = fromObject({ foo: 'bar' }); // => SortedMap<{ foo: 'bar' }>
const obj = unwrap(map); // => { foo: 'bar' }
```

Use a modern bundler such as Webpack 2 or Rollup in order to take advantage of tree shaking capabilities, giving you maximum flexibility to use what you need while excluding anything else from the final build.

----

*Documentation pending*