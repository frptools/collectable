# [![Collectable.js: Immutable Red-Black Tree](https://github.com/frptools/collectable/raw/master/.assets/logo.png)](https://github.com/frptools/collectable)

# Immutable Red-Black Tree

> A persistent/immutable/functional red-black tree data structure

This package provides an immutable variant of a [red-black tree](https://en.wikipedia.org/wiki/Red%E2%80%93black_tree) data structure, which is essentially a balanced binary search tree that maps keys to values and has general O(logN) performance for most operations.

[![Build Status](https://travis-ci.org/frptools/collectable.svg?branch=master)](https://travis-ci.org/frptools/collectable)
[![NPM version](https://badge.fury.io/js/%40collectable%2Fred-black-tree.svg)](http://badge.fury.io/js/%40collectable%2Fset)
[![GitHub version](https://badge.fury.io/gh/frptools%2Fcollectable.svg)](https://badge.fury.io/gh/frptools%2Fcollectable)
[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/FRPTools/Lobby)

- **[Installation](#installation)**
- **[Usage](#usage)**
- **[API](#api)**
  - **[Creating a tree](#creating-a-tree)**  
    [empty()](#emptyk-vcomparatorfn-comparatorfnk-redblacktreek-v)
    | [fromPairs()](#frompairsk-vpairs-k-v-comparatorfn-comparatorfnk-redblacktreek-v)
    | [fromObject()](#fromobjectvobj-associativev-comparatorfn-comparatorfnany-redblacktreestring-v)
  - **[Adding, removing and updating entries in the tree](#adding-removing-and-updating-entries-in-the-tree)**  
    [remove()](#removek-vkey-k-tree-redblacktreek-v-redblacktreek-v)
    | [set()](#setk-vkey-k-value-v-tree-redblacktreek-v-redblacktreek-v)
    | [updateTree()](#updatetreek-vcallback-updatetreecallbackk-v-tree-redblacktreek-v-redblacktreek-v)
    | [update()](#updatek-vcallback-updatetreeentrycallbackk-vundefined-key-k-tree-redblacktreek-v-redblacktreek)
  - **[Reading from the tree](#reading-from-the-tree)**  
    [size()](#sizek-vtree-redblacktreek-v-number)
    | [isEmpty()](#isemptyk-vtree-redblacktreek-v-boolean)
    | [get()](#getk-vkey-k-tree-redblacktreek-v-vundefined)
    | [has()](#hask-vkey-k-tree-redblacktreek-v-boolean)
    | [iterateFromKey()](#iteratefromkeyk-vreverse-boolean-key-k-tree-redblacktreek-v-redblacktreeiteratork-v)
    | [last()](#lastk-vtree-redblacktreek-v-redblacktreeentryk-vundefined)
    | [lastKey()](#lastkeyk-vtree-redblacktreek-v-kundefined)
    | [lastValue()](#lastvaluek-vtree-redblacktreek-v-vundefined)
    | [iterateFromLast()](#iteratefromlastk-vtree-redblacktreek-v-redblacktreeiteratork-v)
    | [at()](#atk-vindex-number-tree-redblacktreek-v-redblacktreeentryk-vundefined)
    | [keyAt()](#keyatk-vindex-number-tree-redblacktreek-v-kundefined)
    | [valueAt()](#valueatk-vindex-number-tree-redblacktreek-v-vundefined)
    | [indexOf()](#indexofk-vkey-k-tree-redblacktreek-v-number)
    | [iterateFromIndex()](#iteratefromindexk-vreverse-boolean-index-number-tree-redblacktreek-v-redblacktreeiteratork-v)
    | [isRedBlackTree()](#isredblacktreearg-collectionany-boolean)
    | [isEqual()](#isequalk-vtree-redblacktreek-v-other-redblacktreek-v-boolean)
    | [type FindOp](#type-findop--gtgteltlteeq)
    | [find()](#findk-vop-findop-key-k-tree-redblacktreek-v-redblacktreeentryk-vundefined)
    | [findKey()](#findkeyk-vop-findop-key-k-tree-redblacktreek-v-kundefined)
    | [findValue()](#findvaluek-vop-findop-key-k-tree-redblacktreek-v-vundefined)
    | [iterateFrom()](#iteratefromk-vop-findop-reverse-boolean-key-k-tree-redblacktreek-v-redblacktreeiteratork-v)
    | [first()](#firstk-vtree-redblacktreek-v-redblacktreeentryk-vundefined)
    | [firstKey()](#firstkeyk-vtree-redblacktreek-v-kundefined)
    | [firstValue()](#firstvaluek-vtree-redblacktreek-v-vundefined)
    | [iterateFromFirst()](#iteratefromfirstk-vtree-redblacktreek-v-redblacktreeiteratork-v)
  - **[Converting a tree to a native JavaScript collection type](#converting-a-tree-to-a-native-javascript-collection-type)**  
    [arrayFrom()](#arrayfromk-vtree-redblacktreek-v-redblacktreeentryk-v)
    | [arrayFrom(mapped)](#arrayfromk-v-umapper-keyedmapfnk-v-u-tree-redblacktreek-v-u)
    | [values()](#valuesk-vtree-redblacktreek-v-v)
    | [keys()](#keysk-vtree-redblacktreek-v-k)
    | [unwrap()](#unwrapk-vdeep-boolean-tree-redblacktreek-v-associativev)
  - **[Switching between mutability and immutability](#switching-between-mutability-and-immutability)**  
    [freeze()](#freezek-vtree-redblacktreek-v-redblacktreek-v)
    | [isFrozen()](#isfrozenk-vtree-redblacktreek-v-boolean)
    | [thaw()](#thawk-vtree-redblacktreek-v-redblacktreek-v)
    | [isThawed()](#isthawedk-vtree-redblacktreek-v-boolean)

--------------------------------------------------------------------------------

## Installation

```bash
# via NPM
npm install @collectable/red-black-tree

# or Yarn
yarn add @collectable/red-black-tree
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
import { empty, set, get } from '@collectable/red-black-tree';

const tree0 = empty();
const tree1 = set(123, 'Collectable.js!', tree0);
const value = get(123, tree1); // value === "Collectable.js!"
```

Use a modern bundler such as Webpack 2 or Rollup in order to take advantage of tree shaking capabilities, giving you maximum flexibility to use what you need while excluding anything else from the final build.

## API

All tree-manipulation functions are available from module `@collectable/red-black-tree`.

----

### Creating a tree

#### `empty<K, V>(ComparatorFn?: ComparatorFn<K>): RedBlackTree<K, V>`

Creates an empty tree. If no ComparatorFn function is supplied, keys are compared using logical less-than and
greater-than operations, which will generally only be suitable for numeric or string keys.

- **ComparatorFn** (_ComparatorFn<K>_): A comparison function, taking two keys, and returning a value less than 0 if the
                                    first key is smaller than the second, a value greater than 0 if the first key is
                                    greater than the second, or 0 if they're the same.
- **returns** (_RedBlackTree<K, V>_): An empty tree

```js
import { ComparatorFn } from '@collectable/core';
import { empty } from '@collectable/red-black-tree';
```


#### `fromPairs<K, V>(pairs: [K, V][], ComparatorFn?: ComparatorFn<K>): RedBlackTree<K, V>`

Creates a new `RedBlackTree` from an array of key/value pairs (tuples). If no ComparatorFn function is supplied, keys
are compared using logical less-than and greater-than operations, which will generally only be suitable for numeric
or string keys.

- **pairs** (_[K, V][]_): An array of pairs (tuples), each being a two-element array of [key, value]
- **ComparatorFn** (_ComparatorFn<K>_): A comparison function, taking two keys, and returning a value less than 0 if the
                                    first key is smaller than the second, a value greater than 0 if the first key is
                                    greater than the second, or 0 if they're the same.
- **returns** (_RedBlackTree<K, V>_): A tree populated with an entry for each pair in the input array

```js
import { ComparatorFn } from '@collectable/core';
import { fromPairs } from '@collectable/red-black-tree';
```

#### `fromObject<V>(obj: Associative<V>, ComparatorFn?: ComparatorFn<any>): RedBlackTree<string, V>`

Creates a new `RedBlackTree` from a plain input object. If no ComparatorFn function is supplied, keys are compared
using logical less-than and greater-than operations, which will generally only be suitable for numeric or string keys.

- **obj** (_Associative<V>_): The input object from which to create a new tree
- **ComparatorFn** (_ComparatorFn<any>_): A comparison function, taking two keys, and returning a value less than 0 if the
                                    first key is smaller than the second, a value greater than 0 if the first key is
                                    greater than the second, or 0 if they're the same.
- **returns** (_RedBlackTree<string, V>_): A tree populated with the keys and values of the input object

```js
import { Associative, ComparatorFn } from '@collectable/core';
import { fromObject } from '@collectable/red-black-tree';
```

--------------------------------------------------------------------------------

### Adding, removing and updating entries in the tree

#### `remove<K, V>(key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V>`

Removes the specified key from the tree. If the key was not in the tree, no changes are made, and the original tree
is returned.

- **key** (_K_): The key of the entry to be removed
- **tree** (_RedBlackTree<K, V>_): The tree to be updated
- **returns** (_RedBlackTree<K, V>_): An updated copy of the tree, or the same tree if the input tree was already mutable

```js
import { remove } from '@collectable/red-black-tree';
```

#### `set<K, V>(key: K, value: V, tree: RedBlackTree<K, V>): RedBlackTree<K, V>`

Adds a new key and value to the tree, or updates the value if the key was previously absent from the tree. If the new
value is the equal to a value already associated with the specified key, no change is made, and the original tree is
returned.

- **key** (_K_): The key of the entry to be updated or inserted
- **value** (_V_): The value that should be associated with the key
- **tree** (_RedBlackTree<K, V>_): The tree to be updated
- **returns** (_RedBlackTree<K, V>_): An updated copy of the tree, or the same tree if the input tree was already mutable

```js
import { set } from '@collectable/red-black-tree';
```

#### `updateTree<K, V>(callback: UpdateTreeCallback<K, V>, tree: RedBlackTree<K, V>): RedBlackTree<K, V>`

* `type UpdateTreeCallback<K, V> = (tree: RedBlackTree<K, V>) => RedBlackTree<K, V>|void`
* `type UpdateTreeEntryCallback<K, V> = (value: V) => V`

Passes a mutable instance of a tree to a callback function so that batches of changes can be applied without creating
additional intermediate copies of the tree, which would waste resources unnecessarily. If the input tree is mutable,
it is modified and returned as-is, instead of being cloned beforehand.

- **callback** (_UpdateTreeCallback<K, V>_): A callback that will be passed a mutable version of the tree
- **tree** (_RedBlackTree<K, V>_): The tree to be updated
- **returns** (_RedBlackTree<K, V>_): An updated version of the tree, with changes applied

```js
import { updateTree } from '@collectable/red-black-tree';
```

#### `update<K, V>(callback: UpdateTreeEntryCallback<K, V|undefined>, key: K, tree: RedBlackTree<K, V>): RedBlackTree<K, V>`

Locates a value in the tree and passes it to a callback function that should return an updated value. If the value
returned is equal to the old value, then the original tree is returned, otherwise a modified copy of the original
tree is returned instead. If the specified key does not exist in the tree, undefined is passed to the callback
function, and if a defined value is returned, it is inserted into the tree. If the input tree is mutable, it is
modified and returned as-is, instead of being cloned beforehand.

- **callback** (_(UpdateTreeEntryCallback<K, V|undefined>)_): A callback that will be passed
- **key** (_K_): The key of the entry to be updated or inserted
- **tree** (_RedBlackTree<K, V>_): The tree to be updated
- **returns** (_RedBlackTree<K, V>_): An updated copy of the tree, or the same tree if the input tree was already mutable

```js
import { update } from '@collectable/red-black-tree';
```

--------------------------------------------------------------------------------

### Reading from the tree

#### `size<K, V>(tree: RedBlackTree<K, V>): number`

Returns the current number of entries in the tree

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_number_): The number of entries in the tree

```js
import { size } from '@collectable/red-black-tree';
```

#### `isEmpty<K, V>(tree: RedBlackTree<K, V>): boolean`

Determines whether or not the tree currently has any entries

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_boolean_): True if the tree is empty, otherwise false

```js
import { isEmpty } from '@collectable/red-black-tree';
```

#### `get<K, V>(key: K, tree: RedBlackTree<K, V>): V|undefined`

Retrieves the value associated with the specified key

- **key** (_K_): The key of the entry to retrieve
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(V|undefined)_): The value associated with the specified key, or undefined if the key does not exist in the tree

```js
import { get } from '@collectable/red-black-tree';
```

#### `has<K, V>(key: K, tree: RedBlackTree<K, V>): boolean`

Determines whether or not a given key exists in the tree

- **key** (_K_): The key to look for
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_boolean_): True if the there is an entry for the specified key, otherwise false

```js
import { has } from '@collectable/red-black-tree';
```

#### `iterateFromKey<K, V>(reverse: boolean, key: K, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>`

Creates an iterator for which the first entry has the specified index in the tree. If the key does not exist in the
tree, an empty iterator is returned.

- **reverse** (_boolean_): If true, the iterator will iterate backward toward the first entry in the tree
- **key** (_K_): The key to look for
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_RedBlackTreeIterator<K, V>_): An iterator that retrieves each successive entry in the tree, starting from the specified key

```js
import { iterateFromKey } from '@collectable/red-black-tree';
```

#### `last<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined`

Retrieves the last entry in the tree.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_([K, V]|undefined)_): A key/value tuple for the last entry in the tree, or undefined if the tree was empty

```js
import { last } from '@collectable/red-black-tree';
```

#### `lastKey<K, V>(tree: RedBlackTree<K, V>): K|undefined`

Retrieves the last key in the tree.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_([K, V]|undefined)_): The key of the last entry in the tree, or undefined if the tree was empty

```js
import { lastKey } from '@collectable/red-black-tree';
```

#### `lastValue<K, V>(tree: RedBlackTree<K, V>): V|undefined`

Retrieves the value of the last entry in the tree.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_([K, V]|undefined)_): The value of the last entry in the tree, or undefined if the tree was empty

```js
import { lastValue } from '@collectable/red-black-tree';
```

#### `iterateFromLast<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>`

Returns an iterator that starts from the last entry in the tree and iterates toward the start of the tree. Emissions
are references to nodes in the tree, exposed directly to allow Collectable.RedBlackTree to be efficiently consumed as
a backing structure for other data structures. Do not modify the returned node.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_RedBlackTreeIterator<K, V>_): An iterator for entries in the tree

```js
import { iterateFromLast } from '@collectable/red-black-tree';
```

#### `at<K, V>(index: number, tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined`

Retrieves the entry at the specified index (ordinal) in the tree. If a negative number is specified for the index,
the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching the
second-last, and so forth.

- **index** (_number_): The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(RedBlackTreeEntry<K, V>|undefined)_): The tree entry at the specified index, or undefined if the index was out of range

```js
import { at } from '@collectable/red-black-tree';
```

#### `keyAt<K, V>(index: number, tree: RedBlackTree<K, V>): K|undefined`

Retrieves the key at the specified index (ordinal) in the tree. If a negative number is specified for the index,
the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching the
second-last, and so forth.

- **index** (_number_): The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(K|undefined)_): The key at the specified index, or undefined if the index was out of range

```js
import { keyAt } from '@collectable/red-black-tree';
```

#### `valueAt<K, V>(index: number, tree: RedBlackTree<K, V>): V|undefined`

Retrieves the value of the entry at the specified index (ordinal) in the tree. If a negative number is specified for
the index, the number is treated as a backtracking offset, with -1 matching the last element in the list, -2 matching
the second-last, and so forth.

- **index** (_number_): The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(V|undefined)_): The value at the specified index, or undefined if the index was out of range

```js
import { valueAt } from '@collectable/red-black-tree';
```

#### `indexOf<K, V>(key: K, tree: RedBlackTree<K, V>): number`

Determines the index (ordinal) of the tree entry that has the specified key. If the key does not exist in the tree, -1 is returned.

- **key** (_K_): The key of the tree entry to find the index for
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_number_): The index of the key in the tree, or -1 if the key was not found

```js
import { indexOf } from '@collectable/red-black-tree';
```

#### `iterateFromIndex<K, V>(reverse: boolean, index: number, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>`

Creates an iterator for which the first entry is at the specified index in the tree. If the index is out of range, an
empty iterator is returned.

- **reverse** (_boolean_): If true, the iterator will iterate backward toward the first entry in the tree
- **index** (_number_): The numeric index of the entry to retrieve (A negative number counts as a backtracking offset from the end of the tree)
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_RedBlackTreeIterator<K, V>_): An iterator that retrieves each successive entry in the tree, starting from the specified index

```js
import { iterateFromIndex } from '@collectable/red-black-tree';
```

#### `isRedBlackTree(arg: Collection<any>): boolean`

Determines whether the input argument is an instance of a Collectable.js RedBlackTree structure.

- **arg** (_RedBlackTree<K, V>_): The input value to check
- **returns** (_boolean_): True if the input value is a RedBlackTree, otherwise false

```js
import { isRedBlackTree } from '@collectable/red-black-tree';
```

#### `isEqual<K, V>(tree: RedBlackTree<K, V>, other: RedBlackTree<K, V>): boolean`

Determines whether two trees have equivalent sets of keys and values. Though order of insertion can affect the
internal structure of a red black tree, only the actual set of entries and their ordinal positions are considered.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **other** (_RedBlackTree<K, V>_): Another tree to compare entries with
- **returns** (_boolean_): True if both trees are of the same size and have equivalent sets of keys and values for each entry
  at corresponding indices in each tree, otherwise false.


```js
import { isEqual } from '@collectable/red-black-tree';
```

#### `type FindOp = 'gt'|'gte'|'lt'|'lte'|'eq'`

An operation used to locate an entry in a tree
- "gt": the leftmost entry with a key greater than the specified input key
- "gte": the leftmost entry with a key greater than or equal to the specified input key
- "lt": the rightmost entry with a key less than the specified input key
- "lte": the rightmost entry with a key less than or equal to the specified input key
- "eq": the entry for which the key is equal to the specified input key

#### `find<K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined`

Returns the entry in the tree which is closest to the specified input key. The logic determining which entry to
locate is controlled by the `op` parameter.

- **op** (_FindOp_): The operation that determines which entry to find in the tree
- **key** (_K_): A reference key used as input to the find operation
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(RedBlackTreeEntry<K, V>|undefined)_): The entry matching the specified key and operation, or undefined if not found

```js
import { find } from '@collectable/red-black-tree';
```

#### `findKey<K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): K|undefined`

Returns the key of whichever entry in the tree which is closest to the specified input key. The logic determining
which entry to locate is controlled by the `op` parameter.

- **op** (_FindOp_): The operation that determines which entry to find in the tree
- **key** (_K_): A reference key used as input to the find operation
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(K|undefined)_): The key of the matched entry, or undefined if no matching entry was found

```js
import { findKey } from '@collectable/red-black-tree';
```

#### `findValue<K, V>(op: FindOp, key: K, tree: RedBlackTree<K, V>): V|undefined`

Returns the value of whichever entry in the tree which is closest to the specified input key. The logic determining
which entry to locate is controlled by the `op` parameter.

- **op** (_FindOp_): The operation that determines which entry to find in the tree
- **key** (_K_): A reference key used as input to the find operation
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(V|undefined)_): The value of the matched entry, or undefined if no matching entry was found

```js
import { findValue } from '@collectable/red-black-tree';
```

#### `iterateFrom<K, V>(op: FindOp, reverse: boolean, key: K, tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>`

Returns an iterator pointing at whichever entry in the tree which is closest to the specified input key. The logic
determining which entry to locate is controlled by the `op` parameter.

- **op** (_FindOp_): The operation that determines which entry to find in the tree
- **reverse** (_boolean_): If true, the iterator will iterate backward toward the first entry in the tree
- **key** (_K_): A reference key used as input to the find operation
- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_RedBlackTreeIterator<K, V>_): An iterator that retrieves each successive entry in the tree, starting from the
  matched entry. If no matching entry is found, an empty iterator is returned.

```js
import { iterateFrom } from '@collectable/red-black-tree';
```

#### `first<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>|undefined`

Retrieves the first entry in the tree, or undefined if the tree is empty.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(RedBlackTreeEntry<K, V>|undefined)_): The first entry in the tree, or undefined if the tree is empty

```js
import { first } from '@collectable/red-black-tree';
```

#### `firstKey<K, V>(tree: RedBlackTree<K, V>): K|undefined`

Retrieves the first key in the tree, or undefined if the tree is empty.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(K|undefined)_): The first key in the tree, or undefined if the tree is empty

```js
import { firstKey } from '@collectable/red-black-tree';
```

#### `firstValue<K, V>(tree: RedBlackTree<K, V>): V|undefined`

Retrieves the value of the first entry in the tree, or undefined if the tree is empty.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_(K|undefined)_): The value of the first entry in the tree, or undefined if the tree is empty

```js
import { firstValue } from '@collectable/red-black-tree';
```

#### `iterateFromFirst<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeIterator<K, V>`

Returns an iterator that starts from the first entry in the tree and iterates toward the end of the tree. Emissions
are references to nodes in the tree, exposed directly to allow Collectable.RedBlackTree to be efficiently consumed as
a backing structure for other data structures. Do not modify the returned node.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_RedBlackTreeIterator<K, V>_): An iterator for entries in the tree

```js
import { iterateFromFirst } from '@collectable/red-black-tree';
```

--------------------------------------------------------------------------------

### Converting a tree to a native JavaScript collection type

#### `arrayFrom<K, V>(tree: RedBlackTree<K, V>): RedBlackTreeEntry<K, V>[]`

Returns an array of key/value tuples. Keys appear first in each tuple, followed by the associated value in the tree.
The array is guaranteed to be in the same order as the corresponding entries in the tree.

- **tree** (_RedBlackTree<K, V>_): The tree to read values from
- **returns** (_RedBlackTreeEntry<K, V>[]_): An array of key/value pairs from the tree

```js
import { arrayFrom } from '@collectable/red-black-tree';
```

#### `arrayFrom<K, V, U>(mapper: KeyedMapFn<K, V, U>, tree: RedBlackTree<K, V>): U[]`

Maps the contents of the tree to an array of transformed values. The array is guaranteed to be in the same order as
the corresponding entries in the tree.

- **mapper** (_KeyedMapFn<K, V, U>_): A callback function that maps an entry in the tree to a new value
- **tree** (_RedBlackTree<K, V>_): The tree to read values from
- **returns** (_U[]_): An array of transformed values; one for each entry in the tree

```js
import { KeyedMapFn } from '@collectable/core';
import { arrayFrom } from '@collectable/red-black-tree';
```

#### `values<K, V>(tree: RedBlackTree<K, V>): IterableIterator<V>`

Returns a value iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as the corresponding entries in the tree.

- **tree** (_RedBlackTree<K, V>_): The tree to read values from
- **returns** (_IterableIterator<V>_): An iterable iterator that will visit each value in the tree

```js
import { values } from '@collectable/red-black-tree';
```

#### `keys<K, V>(tree: RedBlackTree<K, V>): IterableIterator<K>`

Returns a key iterator; one for each entry in the tree. The iterator is guaranteed to iterate in the same order as the corresponding entries in the tree.

- **tree** (_RedBlackTree<K, V>_): The tree to read values from
- **returns** (_IterableIterator<K>_): An iterable iterator that will visit each key in the tree

```js
import { keys } from '@collectable/red-black-tree';
```

#### `unwrap<K, V>(deep: boolean, tree: RedBlackTree<K, V>): Associative<V>`

Returns the tree unwrapped as a plain JavaScript object. Keys are treated as (or converted to) strings.

- **deep** (_boolean_): If true, any valid Collectable.js collection values nested in the tree will also be unwrapped
- **tree** (_RedBlackTree<K, V>_): The tree to read values from
- **returns** (_Associative<V>_): A plain JavaScript object containing entries from the tree.

```js
import { Associative } from '@collectable/core';
import { unwrap } from '@collectable/red-black-tree';
```

--------------------------------------------------------------------------------

### Switching between mutability and immutability

#### `freeze<K, V>(tree: RedBlackTree<K, V>): RedBlackTree<K, V>`

Returns an immutable version of the input tree.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_RedBlackTree<K, V>_): An immutable copy of the input tree, or the same tree if already immutable

```js
import { freeze } from '@collectable/red-black-tree';
```

#### `isFrozen<K, V>(tree: RedBlackTree<K, V>): boolean`

Determines whether or not the tree is currently immutable.

- **tree** (_RedBlackTree<K, V>_): The input tree
- **returns** (_boolean_): True if the tree is currently immutable, otherwise false

```js
import { isFrozen } from '@collectable/red-black-tree';
```

#### `thaw<K, V>(tree: RedBlackTree<K, V>): RedBlackTree<K, V>`

Returns a mutable copy of the tree. Operations performed on mutable trees are applied to the input tree directly,
and the same mutable tree is returned after the operation is complete. Structurally, any internals that are shared
with other immutable copies of the tree are cloned safely, but only as needed, and only once. Subsequent operations
are applied to the same internal structures without making further copies.

- **tree** (_RedBlackTree<K, V>_): The tree to be made mutable
- **returns** (_RedBlackTree<K, V>_): A mutable version of the input tree, or the same tree if it was already mutable

```js
import { thaw } from '@collectable/red-black-tree';
```

#### `isThawed<K, V>(tree: RedBlackTree<K, V>): boolean`

Determines whether or not the specified tree is currently mutable

- **tree** (_RedBlackTree<K, V>_): The tree to be checked
- **returns** (_boolean_): True if the tree is mutable, otherwise false

```js
import { isThawed } from '@collectable/red-black-tree';
```
