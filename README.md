# [![Collectable.js: Immutable Data Structures](https://github.com/frptools/collectable/raw/master/.assets/logo.png)](https://github.com/frptools/collectable)

An all-you-can-eat buffet of high-performance, [persistent](https://en.wikipedia.org/wiki/Persistent_data_structure), [immutable](https://en.wikipedia.org/wiki/Immutable_object), [functional](https://en.wikipedia.org/wiki/Functional_programming) data structures. Collect them all!

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/collectable.svg)](http://badge.fury.io/js/collectable)
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/FRPTools/Lobby)

> _Note: This library is an active **work in progress**. Some of the features and structures mentioned below are currently in progress, pending development, only partially-available, or flagged for cleanup/refactoring, prior to the first full 1.0 release. See the [project board](https://github.com/frptools/collectable/projects) for information on current development status. That all said, the library is very much usable, even at this early stage._

## Features

- [x] A robust suite of **high-performance data structures** for most use cases
- [x] Full **ES2015 module support** so that your application bundle only need grow in size according to what you actually use
- [x] **Functional API**, prioritising an order of parameters best suited for currying and composition
- [ ] :construction: API for **deep operations** on **nested structures**
- [x] Deep and shallow **conversion to and from native types**, including arrays, objects, iterables, Maps and Sets
- [x] Complete set of **TypeScript definitions**
- [ ] Extensive **documentation** and **examples**
- [x] **One package import** to access everything, **or isolated npm packages** for each individual data structure
- [x] Comprehensive unit test suite, consisting of hundreds of tests for every data structure
- [x] Strong focus on a code style that **emphasises high performance** internally

## Data Structures

- [ **[List](/packages/list#collectablejs-immutable-list)** ] A persistent [list/vector](https://en.wikipedia.org/wiki/List_(abstract_data_type)) structure based on a modified [RRB Tree](https://infoscience.epfl.ch/record/169879/files/RMTrees.pdf) implementation.
- [ **[Map](/packages/map#collectablejs-immutable-map)** ] A persistent [hash map](https://en.wikipedia.org/wiki/Associative_array), mapping keys to values. Implemented as a Clojure-style [hash array mapped trie](https://en.wikipedia.org/wiki/Hash_array_mapped_trie).
- [ **[Sorted Map](/packages/sorted-map#collectablejs-immutable-sorted-map)** ] A persistent sorted [map](https://en.wikipedia.org/wiki/Associative_array) backed by a [red-black tree](/packages/red-black-tree#collectablejs-immutable-sorted-set) and a [hash map](/packages/map#collectablejs-immutable-map) with user-definable sort order.
- [ **[Set](/packages/set#collectablejs-immutable-set)** ] A persistent [set](https://en.wikipedia.org/wiki/Set_(abstract_data_type)), backed by a [hash map](/packages/map#collectablejs-immutable-map).
- [ **[Sorted Set](/packages/sorted-set#collectablejs-immutable-sorted-set)** ] A persistent sorted [set](https://en.wikipedia.org/wiki/Set_(abstract_data_type)) backed by a [red-black tree](/packages/red-black-tree#collectablejs-immutable-red-black-tree) and a [hash map](https://en.wikipedia.org/wiki/Associative_array), with user-definable sort order.
- [ **[Red Black Tree](/packages/red-black-tree#collectablejs-immutable-red-black-tree)** ] A persistent [red-black tree](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree), providing a balanced binary search tree which maps keys to values.

See the [road map](https://github.com/frptools/collectable/wiki) for information on further development and plans for additional features and data structures.

## Installation

```bash
# via NPM
npm install collectable

# or Yarn
yarn add collectable
```

TypeScript type definitions are built in.

## Usage

**API Reference:**
[ [General](/packages/collectable#collectablejs-main-package)
| [List](/packages/list#collectablejs-immutable-list)
| [Map](/packages/map#collectablejs-immutable-map)
| [Sorted Map](/packages/sorted-map#collectablejs-immutable-sorted-map)
| [Set](/packages/set#collectablejs-immutable-set)
| [Sorted Set](/packages/sorted-set#collectablejs-immutable-sorted-set)
| [Red Black Tree](/packages/red-black-tree#collectablejs-immutable-red-black-tree)
| [Others...](https://github.com/frptools/collectable/wiki) ]

## Contributor Credits (Deliberate or Unwitting)

- Map implementation adapted from [Tylor Steinberger](https://github.com/TylorS)'s [TypeScript conversion](https://github.com/TylorS/typed-hashmap) of [Matt Bierner's HAMT](https://github.com/mattbierner/hamt_plus) implementation.

Want to help out? See [the guide for contributors](CONTRIBUTING.md).
