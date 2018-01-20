import test from 'ava';
import { DiffTracer, RedBlackTreeEntry, diff, emptyWithNumericKeys, fromNumericKeys } from '../../src';

const baseTree = fromNumericKeys([5, 10, 15, 20]);
const sameSizedTree = fromNumericKeys([10, 12, 15, 18]);

test('makes no calls if the tracer contains no hooks', t => {
  const tracer = diff(new TestTracer(null, null, null), baseTree, sameSizedTree);
  t.is(tracer.events.length, 0);
});

test('makes no calls if both trees are empty', t => {
  const tracer = diff(new TestTracer(true, true, true), emptyWithNumericKeys(), emptyWithNumericKeys());
  t.is(tracer.events.length, 0);
});

test('traces each added node if an addition hook is provided', t => {
  const tracer = diff(new TestTracer(true, null, null), baseTree, sameSizedTree);
  t.deepEqual(tracer.events, [[12, 'added'], [18, 'added']]);
});

test('traces each removed node if a removal hook is provided', t => {
  const tracer = diff(new TestTracer(null, true, null), baseTree, sameSizedTree);
  t.deepEqual(tracer.events, [[5, 'removed'], [20, 'removed']]);
});

test('traces each retained node if a retained hook is provided', t => {
  const tracer = diff(new TestTracer(null, null, true), baseTree, sameSizedTree);
  t.deepEqual(tracer.events, [[10, 'retained'], [15, 'retained']]);
});

test('makes use of every available hook (identical collection size)', t => {
  const tracer = diff(new TestTracer(true, true, true), baseTree, sameSizedTree);
  t.deepEqual(tracer.events, [
    [5, 'removed'],
    [10, 'retained'],
    [12, 'added'],
    [15, 'retained'],
    [18, 'added'],
    [20, 'removed']
  ]);
});

test('makes use of every available hook (increased collection size)', t => {
  const largerTree = fromNumericKeys([2, 10, 12, 15, 20, 25, 30]);
  const tracer = diff(new TestTracer(true, true, true), baseTree, largerTree);
  t.deepEqual(tracer.events, [
    [2, 'added'],
    [5, 'removed'],
    [10, 'retained'],
    [12, 'added'],
    [15, 'retained'],
    [20, 'retained'],
    [25, 'added'],
    [30, 'added']
  ]);
});

test('makes use of every available hook (decreased collection size)', t => {
  const smallerTree = fromNumericKeys([12, 15, 16]);
  const tracer = diff(new TestTracer(true, true, true), baseTree, smallerTree);
  t.deepEqual(tracer.events, [
    [5, 'removed'],
    [10, 'removed'],
    [12, 'added'],
    [15, 'retained'],
    [16, 'added'],
    [20, 'removed']
  ]);
});

test('terminates early if the addition hook returns false', t => {
  const tracer = diff(new TestTracer(false, true, true), baseTree, sameSizedTree);
  t.deepEqual(tracer.events, [
    [5, 'removed'],
    [10, 'retained'],
    [12, 'added']
  ]);
});

test('terminates early if the removal hook returns false', t => {
  const tracer = diff(new TestTracer(true, false, true), baseTree, sameSizedTree);
  t.deepEqual(tracer.events, [
    [5, 'removed']
  ]);
});

test('terminates early if the retained hook returns false', t => {
  const tracer = diff(new TestTracer(true, true, false), baseTree, sameSizedTree);
  t.deepEqual(tracer.events, [
    [5, 'removed'],
    [10, 'retained']
  ]);
});

class TestTracer implements DiffTracer<number> {
  added?: (entry: RedBlackTreeEntry<number>) => boolean;
  removed?: (entry: RedBlackTreeEntry<number>) => boolean;
  retained?: (before: RedBlackTreeEntry<number>, after: RedBlackTreeEntry<number>) => boolean;

  public readonly events: [number, 'added'|'removed'|'retained'][] = [];

  constructor (
    added: boolean|null,
    removed: boolean|null,
    retained: boolean|null,
  ) {
    if(added !== null) this.added = (entry) => (this.events.push([entry.key, 'added']), added);
    if(removed !== null) this.removed = (entry) => (this.events.push([entry.key, 'removed']), removed);
    if(retained !== null) this.retained = (entry) => (this.events.push([entry.key, 'retained']), retained);
  }
}