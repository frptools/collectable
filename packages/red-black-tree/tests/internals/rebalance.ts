import test from 'ava';
import { empty, set } from '../../src';
import { RedBlackTreeStructure, isNone } from '../../src/internals';

let tree: RedBlackTreeStructure<string, User>;

type User = {
  name: string,
  id: string
};

const testUser1: User = {
    name: 'Luke',
    id: '298'
};

const testUser2: User = {
    name: 'Leia',
    id: '299'
};

const testUser3: User = {
  name: 'Han',
  id: '300'
};

const testUser4: User = {
  name: 'Chewbacca',
  id: '301'
};

test.beforeEach(() => {
  tree = empty<string, User>((a, b) => a < b ? -1 : (a > b ? 1 : 0), true);
});

test('should keep the tree balanced', t => {
  t.plan(13);

  // Set 298 and make sure it's the root and no other elements are there
  tree = set(testUser1.id, testUser1, tree);
  t.is(tree._root.key, testUser1.id);
  t.is(isNone(tree._root._left), true);
  t.is(isNone(tree._root._right), true);

  // Set 299, no rebalance. 299 should be on the right
  tree = set(testUser2.id, testUser2, tree);
  t.is(tree._root.key, testUser1.id);
  t.is(isNone(tree._root._left), true);
  t.is(tree._root._right.key, testUser2.id);

  // Set 300, this should cause a rebalance that puts 299 at the top
  tree = set(testUser3.id, testUser3, tree);
  t.is(tree._root.key, testUser2.id); // 299 is root
  t.is(tree._root._left.key, testUser1.id); // 298 goes left
  t.is(tree._root._right.key, testUser3.id); // 300 goes right

  // Set 301, no rebalance - will go on the right of 300
  tree = set(testUser4.id, testUser4, tree);
  t.is(tree._root.key, testUser2.id); // 299 is root
  t.is(tree._root._left.key, testUser1.id); // 298 goes left
  t.is(tree._root._right.key, testUser3.id); // 300 goes right
  t.is(tree._root._right._right.key, testUser4.id); // 300 goes right
});

test('should keep the tree balanced - many items synchronously', t => {
  // Add accounts to the tree which will trigger lots of rebalancing
  for (let i = 0; i < 1000; i++) {
    const user: User = {
      name: i.toString(),
      id: i.toString()
    };
    tree = set(user.id, user, tree);
  }

  t.is(tree._root.key, '487');
  t.is(tree._size, 1000);
});
