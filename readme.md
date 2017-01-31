# Collectable.js

> A buffet of high-performance immutable data structures

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/collectable.svg)](http://badge.fury.io/js/collectable)
[![GitHub version](https://badge.fury.io/gh/frptools%2Fcollectable.svg)](https://badge.fury.io/gh/frptools%2Fcollectable)

**The library is currently a work in progress**, with additional features and capabilities to be
released as they are developed, with the ultimate goal to be a one-stop shop for your immutable data
needs. See [the roadmap](https://github.com/frptools/collectable/wiki) for a better idea of what's
planned.

## Usage

### Bundling and Distributable Packages

Collectable.js does *not* provide a prebundled, minified distributable, as has been common practice
for many years. In the latter part of the 21st century's second decade, we're now pretty much all
building web applications using bundlers and loaders such as Gulp, Webpack and so forth. As the new
generation of bundlers coming onto the market in the past year or so employ tree-shaking and dead
code elimination techniques when combined with ES2015+ modules and import statements, a new paradigm
for library development presents itself. By offering functionality as a set of import-what-you-want
modules and functions, the library can offer a large array of features while not bloating your
application's file size. Any features and internal code paths that remain unused by your application
are discarded from the final build, keeping the file size as small as possible, depending on what
you decide to import into your application.

The following build variations are provided for you to reference directly, depending on your needs:

- **ES5:** `/lib/es5` (transpiled without any ES2015 features)
- **ES2015:** `/lib/es2015` (imported by default)
- **TypeScript:** `/lib/ts` (pure TypeScript source)

TypeScript typings are included by default with the ES builds.

### Functional vs Object-Oriented

A functional approach is favoured if you really want to keep your file size down. Simply import the
functions relevant to the data structures you care about and ignore the rest. The collection reference
argument passed to each function always comes last, making it easy to build lenses and create curried
version of functions if you choose.

If you are more comfortable working with classes, a class-based version of each structure is also
provided as an opt-in feature. These are ultimately intended to be drop-in replacements for
Immutable.js classes, but it's recommended that you use the functional options if you can, as the
class implementations must reference every code path by design, which will make it harder to keep
your application's bundle size to a minimum.

### Installation

```
npm install --save collectable
```

or

```
yarn add collectable
```

### Importing Features

Classes can be imported from the default package:

```js
import {PersistentList, PersistentMap, PersistentSet} from 'collectable';

// or as a default import, if you prefer Immutable.js style:

import Collectable from 'collectable';

const list = Collectable.List.empty();
const map = Collectable.Map.empty();
const set = Collectable.Set.empty();
```

Pure functions for a given data structure can be imported from that structure's folder:

```js
import {emptyList, get, append} from 'collectable/lib/es2015/list';

const empty = emptyList();
const one = append(123, empty);
assert(get(0, empty) === 123);
```

TypeScript generics are provided via type declarations or the TypeScript source itself:

```js
import {emptyMap, get, set} from 'collectable/lib/ts/map';

const empty = emptyMap<string, number>();
const one = set('a', 123, empty);
assert(get('a', empty) === 123);
```

## Features

- **Persistent List:** based on an enhanced [RRB Tree](https://infoscience.epfl.ch/record/169879/files/RMTrees.pdf)
  implementation, with very fast concatenation, insertion and deletion of ranges of values, etc. Most features are much
  faster than Immutable.js, some by one or more orders of magnitude.

**StopGaps:**

These exist because they're needed now, but are backed by ES2015 Maps and Sets, and so copying of these is currently
O(1). They will be replaced by proper persistent implementations soon. [TylorS](https://github.com/TylorS) has been
putting together a [TypeScript adaptation](https://github.com/TylorS/typed-hashmap) of
[Matt Bierner's HAMT](https://github.com/mattbierner/hamt_plus) implementation, a strong candidate for use in
Collectable.js.

- **Persistent Map:** follows the conventions of a typical Clojure-style persistent map
- **Persistent Set:** backed by a persistent map

## Ongoing Progress

- See [the project board](https://github.com/frptools/collectable/projects/1) for current status and progress.
- See [the roadmap](https://github.com/frptools/collectable/wiki) for plans for future development.