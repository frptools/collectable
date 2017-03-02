# Collectable.js: Immutable List

> A persistent vector structure based on a modified RRB Tree

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/%40collectable%2Flist.svg)](http://badge.fury.io/js/%40collectable%2Flist)
[![GitHub version](https://badge.fury.io/gh/frptools%2Fcollectable.svg)](https://badge.fury.io/gh/frptools%2Fcollectable)
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/FRPTools/Lobby)

Collectable's List structure is a Clojure-style persistent vector based on a modified [RRB Tree](https://infoscience.epfl.ch/record/169879/files/RMTrees.pdf) implementation, with very fast concatenation, insertion and deletion of ranges of values, etc. Most features are much faster than Immutable.js, some by one or more orders of magnitude.

*This documentation is under construction. The list of functions below is comprehensive, but descriptions and examples are pending.*

## Installation

```
# via NPM
npm install --save @collectable/list

# or Yarn
yarn add @collectable/list
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
import {fromArray, arrayFrom} from '@collectable/list';

const list = fromArray(['X', 'Y']);
const array = arrayFrom(list);
```

Pre-curried versions of functions for a given data structure are available by appending `/curried` to the import path, like so:

```ts
import {fromArray, append} from '@collectable/list/curried';

const two = fromArray(['X', 'Y']); // => [X, Y]
const addZ = append('Z');
const three = addZ(two); // => [X, Y, Z]
```

Use a modern bundler such as Webpack 2 or Rollup in order to take advantage of tree shaking capabilities, giving you maximum flexbility to use what you need while excluding anything else from the final build.

## API

All list-manipulation functions are available from module `@collectable/list`.

Curried versions of each of these (where applicable) are available from module `@collectable/list/curried`. The curried versions of each function will suffer a minor performance hit due to the additional layers of indirection required to provide a curried interface. In most cases this is not worth worrying about, but if maximum performance is desired, consider using the non-curried API instead.

### Creating a list

#### `empty<T>(): List<T>`

#### `fromArray<T>(values: T[]): List<T>`

#### `fromIterable<T>(values: Iterable<T>): List<T>`

#### `fromArgs<T>(...values: T[]): List<T>`

--------------------------------------------------------------------------------

### Appending and prepending values

#### `append<T>(value: T, list: List<T>): List<T>`

Appends a new value to the end of a list, growing the size of the list by one.

- **value**: The value to append to the list
- **list**: The list to which the value should be appended
- **returns**: A list containing the appended value

```ts
// Primary API
import {fromArray, append} from '@collectable/list';

const two = fromArray(['X', 'Y']); // => [X, Y]
const three = append('Z', two); // => [X, Y, Z]
```

```ts
// Curried API
import {fromArray, append} from '@collectable/list/curried';

const two = fromArray(['X', 'Y']); // => [X, Y]
const addZ = append('Z');
const three = addZ(two); // => [X, Y, Z]
```

#### `appendArray<T>(values: T[], list: List<T>): List<T>`

Appends an array of values to the end of a list, growing the size of the list by the number of
elements in the array.

- **value**: The values to append to the list
- **list**: The list to which the values should be appended
- **returns**: A list containing the appended values

#### `appendIterable<T>(values: Iterable<T>, list: List<T>): List<T>`

Appends a set of values to the end of a list, growing the size of the list by the number of
elements iterated over.

- **value**: The values to append to the list
- **list**: The list to which the values should be appended
- **returns**: A list containing the appended values

#### `prepend<T>(value: T, list: List<T>): List<T>`

#### `prependArray<T>(values: T[], list: List<T>): List<T>`

#### `prependIterable<T>(values: Iterable<T>, list: List<T>): List<T>`

--------------------------------------------------------------------------------

### Updating existing values

#### `set<T>(index: number, value: T, list: List<T>): List<T>`

#### `updateList<T>(callback: UpdateListCallback<List<T>>, list: List<T>): List<T>`

* `type UpdateListCallback<T> = (value: T) => T|void`

#### `update<T>(index: number, callback: UpdateIndexCallback<T|undefined>, list: List<T>): List<T>`

* `type UpdateIndexCallback<T> = (value: T) => T`
--------------------------------------------------------------------------------

### Concatenating lists

#### `concat<T>(left: List<T>, right: List<T>): List<T>`

#### `concatLeft<T>(right: List<T>, left: List<T>): List<T>`

#### `concatAll<T>(lists: List<T>[]): List<T>`

--------------------------------------------------------------------------------

### Switching between mutability and immutability

#### `freeze<T>(list: List<T>): List<T>`

#### `thaw<T>(list: List<T>): List<T>`

#### `isFrozen<T>(list: List<T>): boolean`

#### `isThawed<T>(list: List<T>): boolean`

--------------------------------------------------------------------------------

### Inserting and deleting ranges of values

#### `insert<T>(index: number, value: T, list: List<T>): List<T>`

#### `insertArray<T>(index: number, values: T[], list: List<T>): List<T>`

#### `insertIterable<T>(index: number, values: Iterable<T>, list: List<T>): List<T>`

#### `remove<T>(index: number, list: List<T>): List<T>`

#### `removeRange<T>(start: number, end: number, list: List<T>): List<T>`

--------------------------------------------------------------------------------

### Slicing

#### `skip<T>(count: number, list: List<T>): List<T>`

#### `skipLast<T>(count: number, list: List<T>): List<T>`

#### `take<T>(count: number, list: List<T>): List<T>`

#### `takeLast<T>(count: number, list: List<T>): List<T>`

#### `slice<T>(start: number, end: number, list: List<T>): List<T>`

--------------------------------------------------------------------------------

### Reading from the list

#### `get<T>(index: number, list: List<T>): T|undefined`

#### `first<T>(list: List<T>): T|undefined`

#### `last<T>(list: List<T>): T|undefined`

#### `hasIndex<T>(index: number, list: List<T>): boolean`

#### `iterate<T>(list: List<T>): IterableIterator<T>`

#### `arrayFrom<T>(list: List<T>): T[]`

#### `join<T>(separator: any, list: List<T>): string`

#### `size<T>(list: List<T>): number`

#### `isEmpty<T>(list: List<T>): boolean`

#### `isEqual<T>(list: List<T>, other: List<T>): boolean`
