# Collectable.js

Collectable.js was born out of a need for an immutable data structure where the
sorting characteristics are controllable both in advance and in retrospect,
and which performs well for all common operations that affect the size of the
collection, including appending, prepending, slicing, concatenation, range
insertion and range deletion. Access to elements both by key and by index was
required, and while this is achievable by combining a map and a list under the
hood, no good immutable data structure implementation existed for handling the
latter.

**The first release of Collectable.js provides a custom [RRB tree](https://www.google.com.au/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&cad=rja&uact=8&ved=0ahUKEwjf-IOtrffQAhVTPrwKHXXpBU8QFggcMAA&url=https%3A%2F%2Finfoscience.epfl.ch%2Frecord%2F169879%2Ffiles%2FRMTrees.pdf&usg=AFQjCNGcuAE3g-18EywBnn2R_Sg7GdQlvw&sig2=554zEyOBJXJwgc5CEtOpxg)
implementation as the first piece of the puzzle.** There is some low-hanging
fruit for improving the performance of different operations, but out of the box
it already performs significantly better than [Immutable.List](http://facebook.github.io/immutable-js/docs/#/List)
for most operations.

In the next release, both data structures will be wrapped for internal use by an
outer collection structure which will provide the reactive projection features
that the library was designed to provide. [HAMT+](https://github.com/mattbierner/hamt_plus)
is the most likely candidate for covering the key-based indexing functionality,
but may be replaced later, if it becomes necessary to do so.

- [x] Immutable RRB tree implementation (Collectable.List)
- [ ] Reactive outer collection API (Collectable.Collection)
- [ ] Projections for sorting, filtering, mapping, etc.

See [the project board](https://github.com/frptools/collectable/projects/1) for current status and progress.