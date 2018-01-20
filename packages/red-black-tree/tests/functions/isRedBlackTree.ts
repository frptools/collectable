import test from 'ava';
import { emptyWithNumericKeys, isRedBlackTree } from '../../src';

test('returns true if the argument is a valid RedBlackTree instance', t => {
  const tree = emptyWithNumericKeys<number>();
  t.true(isRedBlackTree(tree));
});

test('returns false if the argument is not a valid RedBlackTree instance', t => {
  t.false(isRedBlackTree(<any>0));
  t.false(isRedBlackTree(<any>1));
  t.false(isRedBlackTree(<any>'foo'));
  t.false(isRedBlackTree(<any>null));
  t.false(isRedBlackTree(<any>void 0));
  t.false(isRedBlackTree(<any>{}));
  t.false(isRedBlackTree(<any>Symbol()));
});
