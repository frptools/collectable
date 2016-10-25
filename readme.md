Collectable.js is currently in development. Check back later.

# Collectable.js - High Performance Immutable Collections

Other collection libraries, such as mori as Immutable.js, are great for general purpose development
and cover most common use cases, as well as providing a comprehensive suite of different collection
types and a myriad of different ways to use those structures. They're also great for when you need
to manage deeply-nested state, with different branches of state having different characteristics
depending on the type of data stored in that branch (a complex JSON structure is a good example).

**Collectable.js** is a special-purpose shallow collection library built for cases when the primary
concern is fast, arbitrary reads and writes from very large collections. The need for fast sorting,
filtering, mapping, inserts and deletes of multiple elements at arbitrary locations, concatenation
and slicing, dual keyed/indexed storage and lookup, and the ability to maintain realtime "views" of
a collection without destroying the original collection, are the primary drivers of the design of
this library.