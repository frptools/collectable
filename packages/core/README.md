# Collectable.js: Core Module

**This module provides functionality that is internal to Collectable.js data structures. You do not need to take it as a dependency directly.**

For unit testing during development set VSCode to build (CTRL/CMD-SHIFT-B; the task is set to
watch/rebuild on changes), then, from your terminal/console in this directory, run one of:

```
$ npm run test-dev
$ yarn run test-dev
```

The project will compile, Mocha will run in watch mode and bail when encountering a failing test.
Because VSCode is building in watch mode too, making a change will recompile source files, and the
compiled outputs will be picked up automatically picked up by Mocha and rerun.

This development testing process is independent of the main Gulp-based build and exists only to make
development easier. Build with Gulp after you're satisfied that source code and tests work correctly.