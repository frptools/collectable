import * as chalk from 'chalk';

declare function require(moduleName: string): any;

import {assert} from 'chai';
import {List} from '../collectable/list';

const enum CONST {
  BRANCH_FACTOR = 4
}

describe('[List]', () => {
  var empty: List<string>;
  var listBF: List<string>;
  var listH1plus1: List<string>;
  var listH2plusBFplus1: List<string>;
  var listH3plusBFplus1: List<string>;
  var listH4plusBFplus1: List<string>;
  var list70k: List<string>;
  var list100k: List<string>;
  var tailSize70k: number;

  before(() => {
    // empty = List.empty<string>();
    // listBF = listOf(CONST.BRANCH_FACTOR);
    listH1plus1 = listOf(CONST.BRANCH_FACTOR + 1);
    listH2plusBFplus1 = listOf(Math.pow(CONST.BRANCH_FACTOR, 2) + CONST.BRANCH_FACTOR + 1);
    listH3plusBFplus1 = listOf(Math.pow(CONST.BRANCH_FACTOR, 3) + CONST.BRANCH_FACTOR + 1);
    listH4plusBFplus1 = listOf(Math.pow(CONST.BRANCH_FACTOR, 4) + CONST.BRANCH_FACTOR + 1);
    // list70k = listOf(70000);
    // list100k = listOf(100000);
    // tailSize70k = (<LNode<string>>list70k._tail).size;
  });

  describe('[internals]', () => {
    // describe('getAdjustedSlotIndex()', () => {
    //   var node = makeRelaxedNode();
    //   it('should return the correct slot index and offset for input index 0', () => {
    //     var index = getAdjustedSlotIndex<string>(node, 0);
    //     assert.strictEqual(index[0], 0);
    //     assert.strictEqual(index[1], 0);
    //   });

    //   it('should return 0 offset for the first slot index', () => {
    //     var index = getAdjustedSlotIndex<string>(node, 10);
    //     assert.strictEqual(index[0], 0);
    //     assert.strictEqual(index[1], 0);
    //   });

    //   it('should return the offset preceding the calculated slot index', () => {
    //     var index = getAdjustedSlotIndex<string>(node, 34);
    //     assert.strictEqual(index[0], 1);
    //     assert.strictEqual(index[1], 32);
    //   });

    //   it('should return the accumulated offset rather than the underlying slot size', () => {
    //     var index = getAdjustedSlotIndex<string>(node, 63);
    //     assert.strictEqual(index[0], 2);
    //     assert.strictEqual(index[1], 63);
    //   });

    //   it('should return -1 for the slot index if out of range', () => {
    //     var index = getAdjustedSlotIndex<string>(node, 1020);
    //     assert.strictEqual(index[0], -1);
    //   });
    // });
  });

  describe('.empty()', () => {
    it('should have size 0', () => {
      const list = List.empty<string>();
      assert.strictEqual(list.size, 0);
    });
  });

  describe('#append()', () => {
    it('should not mutate the original List', () => {
      const empty = List.empty<string>();
      const pushed = empty.append('foo');
      assert.strictEqual(empty.size, 0);
      assert.strictEqual(empty._views[0].slot.slots.length, 0);
      assert.notStrictEqual(empty, pushed);
      assert.notDeepEqual(empty, pushed);
    });

    it('should return the original list if called with no arguments', () => {
      const empty = List.empty<string>();
      const pushed = empty.append();
      assert.strictEqual(empty.size, 0);
      assert.strictEqual(empty, pushed);
    });

    it('should have size:1 after adding the first element', () => {
      const list = List.empty<string>().append('foo');
      assert.strictEqual(list.size, 1);
      assert.deepEqual(slotValues(tailView(list)), ['foo']);
    });

    it('should have size:2 after adding the second element', () => {
      const list = List.empty<string>().append('foo').append('bar');
      assert.strictEqual(list.size, 2);
      assert.deepEqual(slotValues(tailView(list)), ['foo', 'bar']);
    });

    it('should push each additional argument as an independent value', () => {
      const list = List.empty<string>().append('foo', 'bar', 'baz');
      assert.strictEqual(list.size, 3);
      var headValues = slotValues(headSlot(list));
      var tailValues = slotValues(tailView(list));
      assert.strictEqual(headValues[0], 'foo');
      assert.strictEqual(headValues[1], 'bar');
      assert.strictEqual(tailValues[tailValues.length - 1], 'baz');
    });

    it('should be able to grow beyond the size of the default branching factor', () => {
      assert.strictEqual(listH1plus1.size, CONST.BRANCH_FACTOR + 1);
      assert.deepEqual(slotValues(headSlot(listH1plus1)), arrayOf(0, CONST.BRANCH_FACTOR));
      assert.deepEqual(slotValues(tailView(listH1plus1)), arrayOf(CONST.BRANCH_FACTOR, CONST.BRANCH_FACTOR + 1));
      assert.strictEqual(headSize(listH1plus1), CONST.BRANCH_FACTOR);
      assert.strictEqual(tailSize(listH1plus1), 1);
    });

    it('should be able to increase capacity when the root is full', () => {
      var h2Count = Math.pow(CONST.BRANCH_FACTOR, 2) + CONST.BRANCH_FACTOR + 1;
      var h3Count = Math.pow(CONST.BRANCH_FACTOR, 3) + CONST.BRANCH_FACTOR + 1;
      var h4Count = Math.pow(CONST.BRANCH_FACTOR, 4) + CONST.BRANCH_FACTOR + 1;
      assert.strictEqual(listH2plusBFplus1.size, h2Count);
      assert.strictEqual(listH3plusBFplus1.size, h3Count);
      assert.strictEqual(listH4plusBFplus1.size, h4Count);
    });

    it('should surface the rightmost leaf node when it has unused capacity instead of creating a new tail'/*, () => {
      const listA = listH2plusBFplus1.slice(0, 1000);
      assert.isUndefined(listA._tail);
      assert.deepEqual(edgeShape(listA, 'right'), [['V', 32, 1000], ['L', 8, 8, '#999']]);
      const listB = listA.push('x');
      assert.strictEqual(listB._root && listB._root.size, 992);
      assert.strictEqual(listB._tail && listB._tail.size, 9);

      const listC = listH2plusBFplus1.slice(0, 1024);
      assert.isUndefined(listC._tail);
      assert.deepEqual(edgeShape(listC, 'right'), [['V', 32, 1024], ['L', 32, 32, '#1023']]);
      const listD = listC.push('x');
      assert.strictEqual(listD._root && listD._root.size, 1024);
      assert.strictEqual(listD._tail && listD._tail.size, 1);
    }*/);
  });

  describe('#pop()', () => {
    it('should return itself if already empty'/*, () => {
      const list = List.empty();
      assert.strictEqual(list, list.pop());
    }*/);

    it('should not mutate the original list'/*, () => {
      const list = List.empty<string>().append('foo', 'bar', 'baz');
      const listC = list.pop();
      const listB = listC.pop();
      const listA = listB.pop();
      assert.notStrictEqual(list, listA);
      assert.notStrictEqual(list, listB);
      assert.notStrictEqual(list, listC);
      assert.notStrictEqual(listA, listB);
      assert.notStrictEqual(listA, listC);
      assert.notStrictEqual(listB, listC);
      assert.notDeepEqual(list, listA);
      assert.notDeepEqual(list, listB);
      assert.notDeepEqual(list, listC);
      assert.notDeepEqual(listA, listB);
      assert.notDeepEqual(listA, listC);
      assert.notDeepEqual(listB, listC);
    }*/);

    it('should surface the rightmost leaf node as the tail if there are no existing tail elements'/*, () => {
      const values = makeValues(1025);
      const list = List.empty<string>().append(...values);
      const listC = list.pop();
      const listB = listC.pop();
      const listA = listB.pop();

      assert.strictEqual(list.size, 1025);
      assert.strictEqual(rootSize(list), 1024);
      assert.strictEqual(tailSize(list), 1);

      assert.strictEqual(listC.size, 1024);
      assert.strictEqual(listC._root && listC._root.size, 1024);
      assert.strictEqual(listC._tail, void 0);

      assert.strictEqual(listB.size, 1023);
      assert.strictEqual(listB._root && listB._root.size, 992);
      assert.strictEqual(listB._tail && listB._tail.size, 31);

      assert.strictEqual(listA.size, 1022);
      assert.strictEqual(listA._root && listA._root.size, 992);
      assert.strictEqual(listA._tail && listA._tail.size, 30);

      const listD = listH2plusBFplus1.slice(0, 1000);
      assert.isUndefined(listD._tail);
      assert.deepEqual(edgeShape(listD, 'right'), [['V', 32, 1000], ['L', 8, 8, '#999']]);
      const listE = listD.pop();
      assert.strictEqual(listE._root && listE._root.size, 992);
      assert.strictEqual(listE._tail && listE._tail.size, 7);
    }*/);

    it('should decrease list height when surfacing the last remaining leaf in the second root branch'/*, () => {
      assert.strictEqual(depth(listOf(33).pop().pop()), 0);
      assert.strictEqual(depth(listOf(1024 + 33).pop().pop()), 2);
      assert.strictEqual(depth(listOf(1024 + 34).pop().pop()), 3);
      assert.strictEqual(depth(listOf(32768 + 33).pop().pop()), 3);
      assert.strictEqual(depth(listOf(32768 + 34).pop().pop()), 4);
    }*/);
  });

  describe('#get()', () => {
    it('should return undefined if the index is out of range'/*, () => {
      var list = List.empty<string>();
      var listC = listOf(33);
      assert.strictEqual(list.get(0), void 0);
      assert.strictEqual(list.get(-50), void 0);
      assert.strictEqual(list.get(50), void 0);
      assert.strictEqual(listC.get(-50), void 0);
      assert.strictEqual(listC.get(50), void 0);
    }*/);

    it('should return the correct element when it exists in the tail'/*, () => {
      assert.strictEqual(listOf(33).get(32), text(32));
      assert.strictEqual(listOf(1057).get(1056), text(1056));
    }*/);

    it('should return the correct element when pathing through regular nodes'/*, () => {
      assert.strictEqual(listOf(33).get(2), text(2));
      assert.strictEqual(listOf(32).get(31), text(31));
      assert.strictEqual(listOf(33).slice(0, 32).get(31), text(31));
      assert.strictEqual(listOf(1057).get(2), text(2));
    }*/);

    it('should return the correct element when pathing through relaxed nodes'/*, () => {
      assert.strictEqual(listOf(1057).slice(1).get(0), text(1));
      assert.strictEqual(list70k.slice(1027).get(0), text(1027));
    }*/);
  });

  describe('#concat', () => {
    it('should work', () => {
      var list = listOf(5).concat(listOf(3));
    });
  });

  // describe('#slice()', () => {
  //   it('should return the same list if the specified range is a superset of the input list', () => {
  //     assert.strictEqual(empty.slice(0), empty);
  //     assert.strictEqual(empty.size, 0);
  //     assert.strictEqual(listH1plus1.slice(0, 33), listH1plus1);
  //     assert.strictEqual(listH1plus1.size, 33);
  //     assert.strictEqual(listH2plusBFplus1.slice(0, 1057), listH2plusBFplus1);
  //     assert.strictEqual(listH2plusBFplus1.size, 1057);
  //     assert.strictEqual(listH2plusBFplus1.slice(0, 2000), listH2plusBFplus1);
  //     assert.strictEqual(listH2plusBFplus1.size, 1057);
  //   });

  //   it('should return an empty list if the start position is equal to or greater than the end position', () => {
  //     assert.deepEqual(listH2plusBFplus1.slice(0, 0), empty);
  //     assert.deepEqual(listH2plusBFplus1.slice(1, 0), empty);
  //     assert.deepEqual(listH2plusBFplus1.slice(2000, 2000), empty);
  //     assert.deepEqual(listH2plusBFplus1.slice(2001, 2000), empty);
  //   });

  //   it('should treat negative start/end positions as negative offsets from the end of the list', () => {
  //     assert.deepEqual(listH2plusBFplus1.slice(-10), listH2plusBFplus1.slice(1047));
  //     assert.deepEqual(listH2plusBFplus1.slice(0, -10), listH2plusBFplus1.slice(0, 1047));
  //     assert.deepEqual(listH2plusBFplus1.slice(-20, -10), listH2plusBFplus1.slice(1037, 1047));
  //     assert.deepEqual(listH2plusBFplus1.slice(-10, -20), empty);
  //   });

  //   describe('left slice', () => {
  //     it('should leave only the tail if the start position occurs at or after the tail offset', () => {
  //       const listA = list70k.slice(list70k.size - tailSize70k + 1);
  //       assert.strictEqual(listA.size, tailSize70k - 1);
  //       assert.strictEqual(listA._tail && listA._tail.size, tailSize70k - 1);
  //       assert.isUndefined(listA._root);
  //     });

  //     it('should not generate any relaxed nodes if sliced at a root node slot boundary', () => {
  //       const sliceStart = 32768, expectedRemaining = (<ParentNode<string>>list70k._root).size - sliceStart;
  //       const listA = list70k.slice(sliceStart);
  //       assert.deepEqual(edgeShape(listA, 'left'), [
  //         ['V', 2, expectedRemaining],
  //         ['V', 32, 32768],
  //         ['V', 32, 1024],
  //         ['L', 32, 32, text(sliceStart)]
  //       ]);
  //     });

  //     it('should generate relaxed nodes until a clean slot boundary is encountered', () => {
  //       const sliceStart = 1024 + 32, expectedRemaining = (<ParentNode<string>>list70k._root).size - sliceStart;
  //       const listA = list70k.slice(sliceStart);
  //       assert.deepEqual(edgeShape(listA, 'left'), [
  //         ['R', 3, expectedRemaining],
  //         ['R', 31, 32768 - sliceStart],
  //         ['V', 31, 1024 - 32],
  //         ['L', 32, 32, text(sliceStart)]
  //       ]);
  //     });

  //     it('should update range offsets when dissecting existing relaxed nodes', () => {
  //       const listA = list70k.slice(3);
  //       assert.strictEqual(listA.size, (listA._root ? listA._root.size : 0) + (listA._tail ? listA._tail.size : 0));
  //       assert.strictEqual(listA.get(0), text(3));
  //       assert.strictEqual(listA.get(1), text(4));
  //       assert.strictEqual(listA.get(32), text(35));

  //       const listB = listA.slice(3);
  //       assert.strictEqual(listB.size, (listB._root ? listB._root.size : 0) + (listB._tail ? listB._tail.size : 0));
  //       assert.strictEqual(listB.get(0), text(6));
  //       assert.strictEqual(listB.get(1), text(7));
  //       assert.strictEqual(listB.get(25), text(31));
  //       assert.strictEqual(listB.get(26), text(32));
  //       assert.strictEqual(listB.get(58), text(64));

  //       const listC = listB.slice(32);
  //       assert.strictEqual(listC.size, (listC._root ? listC._root.size : 0) + (listC._tail ? listC._tail.size : 0));
  //       assert.strictEqual(listC.get(0), text(38));
  //       assert.strictEqual(listC.get(1), text(39));
  //       assert.strictEqual(listC.get(3), text(41));
  //       assert.strictEqual(listC.get(26), text(64));

  //       const listD = listC.slice(3);
  //       assert.strictEqual(listD.size, (listD._root ? listD._root.size : 0) + (listD._tail ? listD._tail.size : 0));
  //       assert.strictEqual(listD.get(0), text(41));
  //       assert.strictEqual(listD.get(1), text(42));
  //       assert.strictEqual(listD.get(3), text(44));
  //       assert.strictEqual(listD.get(23), text(64));

  //       const listE = listH2plusBFplus1.slice(513, 1025);
  //       assert.strictEqual(listE.get(0), text(513));
  //       assert.strictEqual(listE.get(32), text(545));
  //       assert.strictEqual(listE.get(479), text(992));
  //       assert.strictEqual(listE.get(511), text(1024));
  //       assert.strictEqual(listE.get(512), void 0);
  //     });

  //     it('should change relaxed nodes into regular nodes when only full slots remain', () => {
  //       const slice0 = 1024 + 32, slice1 = 1024 - 32, sliceAmount = slice0 + slice1;
  //       const expectedRemaining = (<ParentNode<string>>list70k._root).size - sliceAmount;
  //       const listA = list70k.slice(slice0);
  //       const listB = listA.slice(slice1);
  //       assert.strictEqual(listA.size, list70k.size - slice0);
  //       assert.strictEqual(listB.size, listA.size - slice1);
  //       assert.deepEqual(edgeShape(listB, 'left'), [
  //         ['R', 3, expectedRemaining],
  //         ['V', 30, 32768 - sliceAmount],
  //         ['V', 32, 1024],
  //         ['L', 32, 32, text(sliceAmount)]
  //       ]);
  //     });

  //     it('should never generate relaxed nodes from leaf nodes', () => {
  //       const listA = list70k.slice(3);
  //       const expectedRemaining = (<ParentNode<string>>list70k._root).size - 3;
  //       assert.deepEqual(edgeShape(listA, 'left'), [
  //         ['R', 3, expectedRemaining],
  //         ['R', 32, 32768 - 3],
  //         ['R', 32, 1024 - 3],
  //         ['L', 29, 29, text(3)]
  //       ]);
  //     });

  //     it('should reduce the tree size when root nodes/branches have only one slot', () => {
  //       const listRootSize = list70k.size - tailSize70k;
  //       const listA = list70k.slice(listRootSize - 1);
  //       assert.strictEqual(listA.size, tailSize70k + 1);
  //       assert.deepEqual(edgeShape(listA, 'left'), [
  //         ['L', 1, 1, text(listRootSize - 1)]
  //       ]);
  //       assert.deepEqual(edgeShape(listA, 'right'), [
  //         ['L', 1, 1, text(listRootSize - 1)]
  //       ]);

  //       const listB = list70k.slice(listRootSize - 33);
  //       assert.strictEqual(listB.size, tailSize70k + 33);
  //       assert.deepEqual(edgeShape(listB, 'left'), [
  //         ['R', 2, 33],
  //         ['L', 1, 1, text(listRootSize - 33)]
  //       ]);
  //       assert.deepEqual(edgeShape(listB, 'right'), [
  //         ['R', 2, 33],
  //         ['L', 32, 32, text(listRootSize - 1)]
  //       ]);

  //       const listC = list70k.slice(listRootSize - 1057);
  //       assert.strictEqual(listC.size, tailSize70k + 1057);
  //       assert.deepEqual(edgeShape(listC, 'left'), [
  //         ['R', 2, 1057],
  //         ['R', 23, 705], // see comment below
  //         ['L', 1, 1, text(listRootSize - 1057)]
  //       ]);
  //       assert.deepEqual(edgeShape(listC, 'right'), [
  //         ['R', 2, 1057],
  //         ['V', 11, 352], // (352) + 705 == 1057 elements, (23) + 11 == 34 slots
  //         ['L', 32, 32, text(listRootSize - 1)]
  //       ]);
  //     });
  //   });

  //   describe('right slice', () => {
  //     it('should only truncate the tail if the slice point occurs after the tail offset', () => {
  //       const removedAmount = tailSize70k - 3;
  //       const end = list70k.size - removedAmount;
  //       const listA = list70k.slice(0, end);
  //       assert.strictEqual(listA._root && listA._root.size, list70k.size - tailSize70k);
  //       assert.strictEqual(listA._tail && listA._tail.size, tailSize70k - removedAmount);
  //     });

  //     it('should retain only the nodes to the left of the slice point', () => {
  //       const removedAmount = tailSize70k + 3;
  //       const expectedRemaining = list70k.size - removedAmount;
  //       const listA = list70k.slice(0, expectedRemaining);

  //       assert.strictEqual(listA.size, expectedRemaining);
  //       assert.strictEqual(listA.get(listA.size - 1), text(listA.size - 1));
  //       assert.strictEqual(listA._root && listA._root.size, expectedRemaining);
  //       assert.isUndefined(listA._tail);

  //       assert.deepEqual(edgeShape(listA, 'right'), [
  //         ['V', 3, expectedRemaining],
  //         ['V', 5, 4445],
  //         ['V', 11, 349],
  //         ['L', 29, 29, text(expectedRemaining - 1)]
  //       ]);
  //     });

  //     it('should reduce the tree size when root nodes/branches have only one slot', () => {
  //       const listA = list70k.slice(0, 1);
  //       assert.deepEqual(edgeShape(listA, 'left'), [
  //         ['L', 1, 1, text(0)]
  //       ]);
  //       assert.deepEqual(edgeShape(listA, 'right'), [
  //         ['L', 1, 1, text(0)]
  //       ]);

  //       const listB = list70k.slice(0, 33);
  //       assert.deepEqual(edgeShape(listB, 'left'), [
  //         ['V', 2, 33],
  //         ['L', 32, 32, text(0)]
  //       ]);
  //       assert.deepEqual(edgeShape(listB, 'right'), [
  //         ['V', 2, 33],
  //         ['L', 1, 1, text(32)]
  //       ]);

  //       const listC = list70k.slice(0, 1057);
  //       assert.deepEqual(edgeShape(listC, 'left'), [
  //         ['V', 2, 1057],
  //         ['V', 32, 1024],
  //         ['L', 32, 32, text(0)]
  //       ]);
  //       assert.deepEqual(edgeShape(listC, 'right'), [
  //         ['V', 2, 1057],
  //         ['V', 2, 33],
  //         ['L', 1, 1, text(1056)]
  //       ]);
  //     });
  //   });

  //   describe('mid slice', () => {
  //     it('should not generate any relaxed nodes if both slices are at root node slot boundaries', () => {
  //       var list = list100k.slice(32768, 98304);
  //       assert.deepEqual(edgeShape(list, 'left'), [
  //         ['V', 2, 65536],
  //         ['V', 32, 32768],
  //         ['V', 32, 1024],
  //         ['L', 32, 32, text(32768)]
  //       ]);
  //       assert.deepEqual(edgeShape(list, 'right'), [
  //         ['V', 2, 65536],
  //         ['V', 32, 32768],
  //         ['V', 32, 1024],
  //         ['L', 32, 32, text(98303)]
  //       ]);
  //     });

  //     it('should reduce the tree size when root nodes/branches have only one slot', () => {
  //       const listRootSize = list70k.size - tailSize70k;
  //       const listA = list70k.slice(listRootSize - 1);
  //       assert.strictEqual(listA.size, tailSize70k + 1);
  //       assert.deepEqual(edgeShape(listA, 'left'), [
  //         ['L', 1, 1, text(listRootSize - 1)]
  //       ]);
  //       assert.deepEqual(edgeShape(listA, 'right'), [
  //         ['L', 1, 1, text(listRootSize - 1)]
  //       ]);

  //       const listB = list70k.slice(listRootSize - 33);
  //       assert.strictEqual(listB.size, tailSize70k + 33);
  //       assert.deepEqual(edgeShape(listB, 'left'), [
  //         ['R', 2, 33],
  //         ['L', 1, 1, text(listRootSize - 33)]
  //       ]);
  //       assert.deepEqual(edgeShape(listB, 'right'), [
  //         ['R', 2, 33],
  //         ['L', 32, 32, text(listRootSize - 1)]
  //       ]);

  //       const listC = list70k.slice(listRootSize - 1057);
  //       assert.strictEqual(listC.size, tailSize70k + 1057);
  //       assert.deepEqual(edgeShape(listC, 'left'), [
  //         ['R', 2, 1057],
  //         ['R', 23, 705], // see comment below
  //         ['L', 1, 1, text(listRootSize - 1057)]
  //       ]);
  //       assert.deepEqual(edgeShape(listC, 'right'), [
  //         ['R', 2, 1057],
  //         ['V', 11, 352], // (352) + 705 == 1057 elements, (23) + 11 == 34 slots
  //         ['L', 32, 32, text(listRootSize - 1)]
  //       ]);
  //     });

  //     it('should change relaxed nodes into regular nodes when only full slots remain [REQUIRES CONCAT]'/*, () => {
  //       const listA = listOf(70000).slice(65537);
  //       // console.log(edgeShape(listA, 'left'));
  //       assert.deepEqual(edgeShape(listA, 'right'), [
  //         ['R', 1, 4447],
  //         ['R', 5, 4447],
  //         ['V', 11, 352],
  //         ['L', 32, 32, text(69983)]
  //       ]);
  //       const listB = listA.slice(0, 1023);
  //       assert.deepEqual(edgeShape(listB, 'right'), [
  //         ['R', 1, 1023],
  //         ['V', 1, 1023],
  //         ['V', 32, 1023],
  //         ['L', 32, 32, text(1023)]
  //       ]);
  //     }*/);
  //   });
  // });

  // describe('#concat()', () => {
  //   it('should return the main list reference if no arguments are supplied', () => {
  //     assert.strictEqual(listBF.concat(), listBF);
  //   });

  //   it('should return the main list reference if all arguments are empty lists', () => {
  //     assert.strictEqual(listBF.concat(empty), listBF);
  //     assert.strictEqual(listBF.concat(empty.append('x').pop()), listBF);
  //     assert.strictEqual(listBF.concat(empty, empty.append('x').pop()), listBF);
  //     assert.strictEqual(listBF.concat(empty.append('x').pop(), empty), listBF);
  //   });

  //   it('should return the first non-empty list reference if only one of the concatenated lists is non-empty', () => {
  //     assert.strictEqual(listBF.concat(empty), listBF);
  //     assert.strictEqual(empty.concat(listBF), listBF);
  //     assert.strictEqual(empty.concat(empty.append('x').pop(), listBF), listBF);
  //     assert.strictEqual(empty.concat(empty, listBF, empty.append('x').pop(), empty), listBF);
  //   });

  //   it('should merge subsequent tails left without changing the root if the first tail has sufficient capacity', () => {
  //     const listA = listBF.push('x').pop();
  //     const listB = listOf(10);
  //     const listC = listA.concat(listB);
  //     assert.isUndefined(listA._tail);
  //     assert.strictEqual(listA._root && listA._root.size, 32);
  //     assert.isUndefined(listB._root);
  //     assert.strictEqual(listB._tail && listB._tail.size, 10);
  //     assert.strictEqual(listC._root && listC._root.size, 32);
  //     assert.strictEqual(listC._root, listA._root);
  //     assert.strictEqual(listC._tail, listB._tail);
  //   });

  //   it('should properly concatenate multiple lists of the same height');
  //   it('should properly concatenate multiple lists of different heights');
  //   it('should be able to append the main list to itself via concatenation arguments');
  // });

  // describe('speed stuff', () => {
  //   var list = listOf(1000000);
  //   var sp: [number, number][] = [];
  //   var start = (list.size*3/4)>>>0;
  //   var end = (list.size/4)>>>0;
  //   for(var i = 0; i < 1000000; i++) {
  //     sp.push([(Math.random()*start)>>>0, start + (Math.random()*end)>>>0]);
  //   }
  //   it('test1', function() {
  //     this.timeout(600000);
  //     // // var old = list;
  //     // // console.log(list);
  //     // // console.log(list.slice(2, 600002));
  //     // for(var a = 0, b = 1, i = 0; a < list.size && i < 1000000; i++, b >= list.size - 1 ? (b = (++a) + 100000) : ++b) {
  //     //   list.slice(a, b);
  //     // }
  //     // console.log(i);

  //     console.log(list.size);
  //     for(i = 0; i < sp.length; i++) {
  //       list = list.slice(0, list.size-1);
  //     }
  //     console.log(list.size, i);
  //     // return new Promise(resolve => {
  //     //   var arr: any[] = [], c = 0;
  //     //   function f() {
  //     //     if(c++ < 100) setTimeout(f, 10);
  //     //   }
  //     //   setTimeout(f, 100);
  //     //   // for(i = 0; i < sp.length; i++) {
  //     //   //   list.slice(sp[i][0], sp[i][1]);
  //     //   // }
  //     //   // for(i = 0; i < sp.length; i++) {
  //     //   //   list.slice(sp[i][0], sp[i][1]);
  //     //   // }
  //     //   // for(i = 0; i < sp.length; i++) {
  //     //   //   list.slice(sp[i][0], sp[i][1]);
  //     //   // }
  //     // });
  //   });
  // });
});

// function dump(value: any): void {
//   console.log(require('util').inspect(value, false, 10, true));
// }

// function log(...args: any[])
// function log() {
//   console.log.apply(console, arguments);
// }

// function show(target) {
//   if(!target) {
//     log(chalk.bold.red('cannot show list/view/slot; specified target has no value'));
//     return;
//   }
//   var views: any[] = [], view: any, slot: any;
//   var s = '';
//   if('start' in target) {
//     log(chalk.bold.white('\n# --- SHOW VIEW ---'));
//     view = target;
//   }
//   else if (target._views) {
//     log(chalk.bold.white('\n# --- SHOW LIST ---'));
//     view = target._views[target._views.length - 1];
//     s += chalk.blue(`[List group: ${target._id}, size: ${target.size}]\n`);
//   }
//   else {
//     log(chalk.bold.white('\n# --- SHOW SLOT ---'));
//   }
//   if(view) {
//     for(; view.parent; view = view.parent) {
//       views.push(view);
//     }
//     view = views[views.length - 1];
//     slot = view.slot;
//   }
//   else {
//     slot = target;
//   }
//   s += display(slot, 0, views);
//   log(s);
//   log(chalk.bold.white('# --- END DUMP ----\n'));
// }

// function val(v, dark?) {
//   return v === void 0 ? chalk.red('?') : dark ? chalk.blue(v) : chalk.green(v);
// }

// function display(slot, indent, views: any[]) {
//   var spacer = new Array(indent + 1).join(' ');
//   if(!slot) return chalk.grey(spacer + '[Unassigned Slot]');
//   var viewIndex = views.findIndex(v => v.slot === slot);
//   var s = '';
//   if(viewIndex > -1) {
//     var view = views[viewIndex];
//     s += chalk.magenta(`${spacer}{View #${viewIndex}:${chalk.bold.white.bgBlue(view.id)}, group: ${val(view.group, true)}, shift: ${val(view.shift)}, START: ${val(view.start, true)}, END: ${val(view.end, true)}, parent: ${view.parent.parent?chalk.bold.white.bgBlue(view.parent.id):'void'}, meta: ${val(view.meta, true)}}\n`);
//   }
//   s += `${spacer}[Slot group: ${val(slot.group)}, shift: ${val(slot.shift)}, meta: ${val(slot.meta)}, id: ${val(slot.id)}, count: ${slot.slotCount}]`;
//   if(slot.slots && slot.slots.length) {
//     if(!slot.slots[0] || !slot.slots[0].slots) {
//       s += ` [ ${slot.slots.map(v => chalk.green(v)).join(', ')} ]`;
//     }
//     else {
//       for(var i = 0; i < slot.slots.length; i++) {
//         s += '\n' + display(slot.slots[i], indent + 2, views);
//       }
//     }
//   }
//   return s;
// }

function rootSlot(value: any): void {
  return rootView(value).slot;
}

function rootView(listOrView: any): any {
  var view = tailView(listOrView);
  while(view && view.parent && view.parent.parent) view = view.parent;
  return view;
}

function tailView<T>(list: List<T>): any {
  return list._views[list._views.length - 1];
}

function headView<T>(list: List<T>): any {
  return list._views[0];
}

function headSlot<T>(list: List<T>): any {
  var view = rootView(list);
  var slot = view.slot;
  while(slot.slots[0] && slot.slots[0].slots) {
    if(slot === slot.slots[0]) assert.fail();
    slot = slot.slots[0];
  }
  return slot;
}

function viewSize(view: any): number {
  return view ? view.end - view.start : -1;
}

function rootSize<T>(list: List<T>): number {
  return viewSize(rootView(list));
}

function tailSize<T>(list: List<T>): number {
  return viewSize(tailView(list));
}

function headSize<T>(list: List<T>): number {
  return headSlot(list).slots.length;
}

function slotValues(viewOrSlot: any): string[] {
  return (viewOrSlot.slot || viewOrSlot).slots;
}

function arrayOf(start: number, end: number): string[] {
  var arr = new Array<string>(end - start);
  for(var i = 0; i < arr.length; i++) {
    arr[i] = text(start + i);
  }
  return arr;
}

function listOf(size: number): List<string> {
  const values = makeValues(size);
  var list = List.empty<string>();
  while(list.size < size) {
    list = list.append(...values.slice(list.size, list.size + 297));
  }
  return list;
}

function text(i: number) {
  return '#' + i;
}

function makeValues(count: number): string[] {
  var values: string[] = [];
  for(var i = 0; i < count; i++) {
    values.push(text(i));
  }
  return values;
}

// function makeRelaxedNode(): RNode<string> {
//   var slotSizes = [
//     32, 31, 32, 32, 32, 32, 32, 32,
//     32, 32, 31, 30, 32, 32, 32, 32,
//     32, 32, 32, 32, 32, 32, 32, 32,
//     32, 32, 32, 32, 32, 31, 32
//   ];
//   var slots = slotSizes.map((size, i) => makeNode(size, i + ':'));
//   var size = slotSizes.reduce((size, n) => size + n, 0);
//   var ranges = slotSizes.reduce((arr: number[], n: number) => (arr.push(n + (arr[arr.length-1]||0)), arr), []);
//   return <RNode<string>>new Node<LNode<string>>(new ID(), size, size, 5, 0, slots, ranges);
// }

// function makeNode(size, prefix: string = ''): LNode<string> {
//   var id = new ID();
//   return <any>new Node<string>(new ID(), size, 32, 0, 0, makeValues(size).map(s => prefix + s), void 0);
// }

// function depth<T>(list: List<T>): number {
//   if(list._root === void 0) return 0;
//   function calc(root, n) {
//     return root.shift === 0 ? n : calc(root.slots[0], n + 1);
//   }
//   return calc(list._root, 1);
// }

// function edgeShape<T>(list: List<T>, side: 'left'|'right'): any[] {
//   var shape: any[] = [];
//   var node: any = list._root;
//   while(node && node.slots) {
//     var child = node.slots[side === 'left' ? 0 : node.slots.length - 1];
//     if(node.ranges || child.slots) {
//       shape.push([node.ranges ? 'R' : 'V', node.slots.length, node.size]);
//     }
//     else {
//       shape.push(['L', node.slots.length, node.size, child]);
//       break;
//     }
//     node = child;
//   }
//   return shape;
// }

// function lastNode(node: any) {
//   node = node.slots[node.slots.length - 1];
//   return node.shift === 0 ? node : lastNode(node);
// };

// function sizeOf(node: any): number {
//   return node ? node.size : 0;
// }

// function descrNodeCompact(node: any): string {
//   return !node ? 'VOID' : `[${node.shift ? node.ranges ? 'R' : 'V' : 'L'}: ${node.size}/${node.capacity} (${node.slots.length} slots, >>${node.shift}]`;
// }

// function descrList(list: any): string {
//   return !list ? 'VOID' : `size: ${list.size}, root: ${descrNodeCompact(list._root)}, tail: ${descrNodeCompact(list._tail)}`;
// }

// function descrNode(node: any): string {
//   return !node ? 'VOID' : `${node.shift ? node.ranges ? 'RNode' : 'VNode' : 'LNode'}, size: ${node.size}, capacity: ${node.capacity}, slots: ${node.slots.length}, shift: ${node.shift}`;
// }
