# [![Collectable.js: Immutable Set](https://github.com/frptools/collectable/raw/master/.assets/logo.png)](https://github.com/frptools/collectable)

# Immutable Sorted Set

> An persistent sorted set data structure with user-definable sort order

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/%40collectable%2Fsorted-set.svg)](http://badge.fury.io/js/%40collectable%2Fsorted-set)

*This documentation is under construction. The list of functions, descriptions and examples are pending.*

## Installation

```bash
# via NPM
npm install @collectable/sorted-set

# or Yarn
yarn add @collectable/sorted-set
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
import { fromArray } from '@collectable/sorted-set';

const set = fromArray(['X', 'Y']); // => SortedSet<[X, Y]>
const array = Array.from(set); // => [X, Y]
```

Use a modern bundler such as Webpack 2 or Rollup in order to take advantage of tree shaking capabilities, giving you maximum flexibility to use what you need while excluding anything else from the final build.

----

*Documentation pending*