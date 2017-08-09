# Guidelines for contributors

Collectable is a monorepo, so there are multiple subpackages of the main package. These can be utilised individually, or installed via the main package in order to save time and gain access to multiple data structure at once, with additional functionality for deep operations between certain primary structures (think Immutable.js' `toJS`, `fromJS`, `setIn`, `getIn`, etc.).

<!-- TOC -->

- [Semantic Versioning](#semantic-versioning)
- [Commits](#commits)
  - [Examples](#examples)
- [Package Structure](#package-structure)
- [Development of new data structure packages](#development-of-new-data-structure-packages)
  - [Transient mutation and batch operations](#transient-mutation-and-batch-operations)
    - [Batch membership](#batch-membership)
    - [Group membership](#group-membership)
  - [Collection type information](#collection-type-information)
    - [Indexable collections](#indexable-collections)
  - [Unwrapping](#unwrapping)
  - [Core library](#core-library)
- [Building](#building)
  - [Building with Gulp](#building-with-gulp)
  - [Concurrent development and testing](#concurrent-development-and-testing)

<!-- /TOC -->

## Semantic Versioning

In 2016, [André Staltz](https://github.com/staltz) published [_compatible versioning_](https://github.com/staltz/comver), a simpler, more consistent application of NPM's semantic versioning standard. Collectable.js follows André's proposal, with one minor adjustment. The third value ("patch") does have a useful purpose; sometimes there is a need to publish an update that does not affect source code at all. Examples are:

- Publishing an update to the NPM registry in order to update README documentation
- Updating package.json dependency versions where source code that uses the updated dependencies is unaffected
- Publishing updated packages/releases after publishing a package version incorrectly due to human error
- Anything else that requires a new package release without the need for source code changes

In summary:

**[MAJOR].[MINOR].[PATCH]**

- **[MAJOR]** _2.3.1 --> 3.0.0_ : This release has at least one breaking change, however minor it may be
  - Complete overhauls/reworks of the product
  - Public API revisions where the signatures of existing functions, methods and classes are changed or removed
  - Changes to dependencies where the changed behaviours of dependencies may indirectly break dependant projects
- **[MINOR]** _1.0.1 --> 1.1.0_ : This release has source code changes, but none of them are breaking changes
  - New features
  - Bug fixes
  - Performance improvements
- **[PATCH]** _1.0.1 --> 1.0.2_ : No source code changes were made, but there is a need to republish the package for some reason
  - Fixed a typo in the main README
  - Forgot to build the project before publishing
  - Updated minor/patch versions of dependencies without needing to touch source code

## Commits

The convention for commit messages is as follows, and must be followed before a pull request will be accepted:

```
TARGET(type): Message

TARGET(type): Message; fixes #123

TARGET(type): Message
- Specific change 1
- Specific change 2
- Etc.
```

`TARGET` refers to the package affected by the changes. Valid values are:

- `ALL` - affects all packages
- `MISC` - addresses a concern that affects a subset of available packages
- `MAIN` - main (root) package, aka "collectable"
- Child packages:
  - `LIST`: @collectable/list
  - `MAP`: @collectable/map
  - `SET`: @collectable/set
  - `SSET`: @collectable/sorted-set
  - `SMAP`: @collectable/sorted-map
  - `RBT`: @collectable/red-black-tree
  - `CKFL`: @collectable/cuckoo-filter
  - Others assigned as new packages become available.

The `type` descriptor is a variation on the Google's pseudo-standard for semantic commit messages, which I don't like.

> _I don't like "feat" because it's abbreviated arbitrarily, and yet "refactor" is not. Also, "feat" doesn't read well, in my opinion, not to mention that not all enhancements are features, per se. I don't like "chore" because it implies that anything to do with the build process is boring or gruelling. I've abbreviated "refactor" because if you're going to do something, be consistent._

| Type Name | Changed From | Meaning
|-----------|--------------|-----------------------------------------------------------------------
| **impl**  | _feat_       | Implementation/iteration of new features, enhancements and packages
| **fix**   | -            | Bug fixes, both to features and tests
| **docs**  | -            | Changes to readme files, documentation, examples, jsdoc comments
| **style** | -            | Whitespace, formatting, semicolons, etc.
| **refac** | _refactor_   | Refactoring to improve code quality without affecting behaviour
| **perf**  | -            | Changes that target performance without affecting behaviour
| **test**  | -            | Implementation of new unit tests, perf tests and other types of tests
| **build** | _chore_      | Build process, releases, package publishing, infrastructure for tools, docs, perf tests, unit tests, etc.

- Capitalize the first letter following the initial colon, e.g. "MAIN(docs): Fix whatever", not "MAIN(docs): fix whatever".
- Bug fix commits should describe the bug, rather than the act of fixing it, as the _fix_ tag already does that job, e.g. "LIST(fix): Error when growing the tree, fixes #123", not "LIST(fix): Fix issue with tree growth, fixes #123".
- The sole exception to the above rule is when fixing something where the _fix_ tag does not apply, e.g. "MAIN(style): Fix typo in README".
- Write commit messages as present tense, for consistency, e.g. "Implement feature X", rather than "Implemented feature X".
- Keep commit messages short, where possible. The first line should be a brief indicator of what the commit is about, not exceeding 50-70 characters in length. Further details can be added as bullet points on subsequent lines, but should be kept as terse as possible, within reason. Nobody wants to read an essay in a commit message.

_Note: Violations to the above rules exist in the repo history due to the fact that these rules were only nailed down partway through development. All new commit messages must follow these rules, however._

### Examples

```
MAP(impl): Implement add, remove

LIST(fix): Error when appending, fixes #123

MAIN(build): Perf test infrastructure complete

SSET(style): Resolve tslint issues
- Missing semicolon in functions/add.ts
- Missing semicolon in functions/remove.ts
- Extraneous whitespace in tests/iterate.ts
```

## Package Structure

For consistency and interoperability, each package should try to use the same setup as much as possible. All data structures must implement a minimal interface which provides basic, compulsory functionality and type information that Collectable can use to recognise an object as a collection and perform certain classes of deep operations, where relevant. Take a look at other packages for comparison with the following:

```bash
/packages/name                 # put your collection here
/packages/name/package.json    # copy from another package; @typed/curry and @collectable/core are required dependencies.
/packages/name/.npmignore      # just copy this from another package
/packages/name/README          # see the other packages README files; common format and API documentation
/packages/name/src             # primary source code
/packages/name/src/functions   # separate each API function, or group of related functions, into individual files
/packages/name/src/internals   # "internal use only" code here
/packages/name/src/index.ts    # entrypoint; must export all primary public types
/packages/name/src/curried.ts  # use @typed/curry to export optional curried versions of all main functions
/packages/name/src/class.ts    # [OPTIONAL] A class-based function wrapper to provide an Immutable.js drop-in replacement
/packages/name/tests           # mocha/chai-based tests
```

It is recommended that you symlink local `@collectable/*` packages before installing dev dependencies if you intend to make changes to them, or if the master branch is ahead of what is currently published:

```bash
$ cd packages/core
$ npm link
$ cd ../..
$ npm link @collectable/core
$ gulp build --pkg core        # see further below for more information about the gulp setup
```

## Development of new data structure packages

Collectable.js prefers a functional approach, but your main persistent data structure is implemented as a class with a minimal interface. Do not apply list manipulation methods to the class, it is meant only as a container with core functionality.

```ts
// ./src/internals/foo.ts

import {isMutable, Collection, CollectionTypeInfo} from '@collectable/core';

const FOO_TYPE: CollectionTypeInfo = {
  // explained further below
};

class Foo<T> implements Collection<T> {
  get '@@type'() { return FOO_TYPE; }
  
  // Suggested, but not required:
  constructor(
    public _group: number, // Subcomponents of this data structure can only be written to if they are members of this group
    public _owner: number, // The structure is freely mutable if isMutable(owner)
    public _size: number,  // these *should* be `internal`, but that feature does not exist in TypeScript yet
    // ... whatever else you need
  ) {}

  [Symbol.iterator](): IterableIterator<T|undefined> {
    return createIterator(this); // you'll need to implement this yourself
  }
}
```

### Transient mutation and batch operations

The constructor properties listed above are preferred for consistency, efficiency, and interoperability with Collectable's batching capabilities:

- **group:** To allow for efficient modifications, use an internal group value (usually a number or symbol) against each internal construct that makes up the data structure. When a new operation begins, generate a new group value and keep track of it while applying changes. Make copies of internal objects only if they don't match the current group value. If they match, then you know that this instance of a given object was created internally and is safe to modify.
- **owner:** To allow for batches of operations to be performed efficiently, use the following convention:
  - If `0`, the object is "frozen" (i.e. immutable), so follow the rules for the `group` property, above.
  - If `-1`, the object is currently "thawed" so that many operations can be performed in isolation before the object is subsequently frozen and passed externally.
  - Other values are treated as `-1`, but only if they match the "ambient" value of the current batch. A call to `isMutable`, found in `@collectable/core`, will determine whether the value should be treated like `0` or `-1`.

#### Batch membership

Use `batch.owner(prefer_mutable?)` to get the value of the current batch, or if no batch is currently active, a value of `0` when passing false, or `-1` for true, with respect to your need to freeze or thaw the collection instance. When the batch ends, or is replaced with a new batch, it won't matter that you still have a reference to the old batch value. Because it has expired, it won't match the current "ambient" batch value, and thus will be treated the same as if it were `0`.

#### Group membership

When beginning a new operation, generate a new value for `group` if the object is currently frozen (checked via `isMutable(foo._owner)`). By generating a new group value, you will ensure that internal substructures are not modified unless safe to do so. Keep in mind that even if the data structure is currently thawed for in-place mutation, internal substructures still need to be cloned if they don't match the current group, as, whatever group they were initially, they may be referenced internally in other collection instances that are still frozen and thus expected to behave as immutable objects.

### Collection type information

The `@@type` property is used internally by other Collectable functionality in order to allow it to automatically
recognise and interface with your collection when it nests, or is nested within, other data structures in the library.

There are two main interfaces you can implement:

```ts
const FOO_TYPE: CollectionTypeInfo = {
  type: Symbol('Collectable.Foo'), // provide a unique symbol for this
  indexable: false,                // indicates that your structure matches keys to values in some way

  equals(other: any, collection: any): boolean {
    return equals(this, other);    // determine if two instances of your structure have the same data
  },

  unwrap(collection: any): any {   // converts the instance back into a native JavaScript object or array
    return unwrap(true, list);     // you'll need to implement this yourself
  },

  owner(collection: any): number { // retrieves the current owner value stored against the collection
    return collection._owner;      // (see "Transient mutation and batch operations" for details)
  },

  group(collection: any): number { // retrieves the current group value stored against the collection
    return collection._group;      // (see "Transient mutation and batch operations" for details)
  }
};
```

#### Indexable collections

If members of your collection are able to be managed via a corresponding key (such as a numeric index or a hashable value), you'll need to provide some additional type information to expose this functionality to Collectable's core API automatically, so that it can participate in operations involving deeply-nested aggregates of different data structures.

The following interface is provided:

```ts
export interface IndexableCollectionTypeInfo extends CollectionTypeInfo {
  get(key: any, collection: any): any; // retrieve an element of your collection
  has(key: any, collection: any): boolean; // determine if a particular key exists in your collection
  set(key: any, value: any, collection: any): any; // set the value corresponding to the specified key
  update(key: any, updater: (value) => any, collection: any): any; // retrieve and update a value via a callback
  verifyKey(key: any, collection: any): boolean; // indicate whether your collection can handle a key of this type
}
```

Your implementations of the above should simply wrap functions within your own public API. These methods will only be passed collection instances that have been pre-verified to be instances of your data structure, which means your implementation of the above extended interface can use strongly-typed parameters safely, rather than the untyped versions described by the interface.

[Take a look at the List implementation](https://github.com/frptools/collectable/blob/b375ca776706f1a8becaebdf9d5a60422d04f900/packages/list/src/internals/list.ts#L9-L59) for an example implementation.

### Unwrapping

Users often need to convert to and from native objects or arrays in order to serialize data or work with other external functionality. Collectable's core API provides a way to convert deeply-nested structures in a single operation.

Note that the example argument `true`, that you're passing to your own `unwrap` function in the example above, provides a way to indicate whether you should also try to (recursively) unwrap elements that are identifiable as Collectable-compliant collections. Doing this allows you to expose an unwrap function as part of your API that is capable of both shallow and deep conversion, and hardcoded for deep conversion when called via the type information object. Here's how you would do that:

```ts
// ./src/functions/unwrap.ts

import {unwrapAny, isCollection} from '@collectable/core'; // import the main "universal" unwrap function

export function unwrap<T>(deep: boolean, foo: Foo<T>): T[] {
  // Let's say you're iterating through your collection's elements:
  const it = foo[Symbol.iterator]();
  var current: IteratorResult<T>;
  var results: any[] = []; // your unwrapped array, if that's how you want to return the collection members
  while(!(current = it.next()).done) {
    var value = current.value;
    // If the user wants deep unwrapping and the element is a collection, unwrap it. Collectable will do the rest.
    results.push(deep && isCollection(value) ? unwrapAny(value) : value);
  }
}
```

Collectable also provides circular reference detection in order to safely and correctly unwrap objects that would otherwise recurse infinitely. To make use of this feature (highly recommended!), you'll need to do the following:

1. import `preventCircularRefs` from `@collectable/core`
2. pass the following:
   - a callback to create your empty output target (e.g. an array or plain object)
   - a callback to unwrap your collection elements into the output target
   - an instance of your collection
3. The function returns the successfully-unwrapped result

Internally, your collection instance will be correlated with the output target you created. During recursive unwrapping, if your collection is encountered a second time, instead of unwrapping it, the existing output target will be returned directly, which will preserve the structural correctness of the outer output object, prevent duplicate work and avoid infinite recursion during the operation.

See the `unwrap` implementations of other Collectable packages for reference.

### Core library

Before beginning (or porting) your implementation, take a look at [the functions exposed by the core API](https://github.com/frptools/collectable/tree/master/packages/core/src). Try to reuse this functionality where possible. Code reuse is a good thing.

## Building

The project is **optimised for development and testing using [VS Code](https://code.visualstudio.com/)**, but you can use other development environments--you may just have to configure some things yourself.

**The main gulp process is for production builds,** and is designed to be used **when development and testing is finished**. It lints, builds and tests the distributable modules for each package. It also runs **a simple preprocessor** over TypeScript source in order to **remove certain patterns of debug-only code**, which means you can fill your code with logging and debug statements and leave them there for ongoing development **without compromising production builds.**

### Building with Gulp

To build with Gulp, which you should do at least to ensure that any debug-only code has been correctly stripped from the production build, just use the raw gulp command to build the main package, or specify an individual package name as an option:

```bash
$ gulp             # build the main package
$ gulp --pkg name  # build the individual package in /packages/name
```

### Concurrent development and testing

The settings for VS Code are preconfigured to build all Collectable packages to a common location, in watch mode, and without preprocessing. In your console or terminal:

```bash
$ cd packages/whatever
$ npm run test-dev
```

Mocha tests will now quickly run and re-run whenever the code rebuilds, without all the extraneous build processes that occur when building using Gulp. Due a to a bug somewhere in the toolchain between Mocha and TypeScript, if you use `.only(...)` on any of your suites or tests, and then remove them, the watch process will default to thinking you have no tests. To fix, just restart the test process.

Settings are also preconfigured to launch the debugger correctly against your tests, so just set breakpoints and go for it.
