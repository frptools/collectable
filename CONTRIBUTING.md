# Guidelines for contributors

Collectable is a monorepo, so there are multiple subpackages of the main package. These can be utilised individually, or installed via the main package in order to save time and gain access to multiple data structure at once, with additional functionality for deep operations between certain primary structures (think Immutable.js' `toJS`, `fromJS`, `setIn`, `getIn`, etc.).

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

## Development of new data structure packages

Collectable.js prefers a functional approach, but your main persistent data structure is implemented as a class with a minimal interface. Do not apply list manipulation methods to the class, it is meant only as a container with core functionality.

**TODO: Documentation**
