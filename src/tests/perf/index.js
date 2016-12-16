global.require = require;
global.List = require('../../../lib/collectable').List;
global.Immutable = require('immutable');

function makeValues(count) {
  var values = new Array(count);
  for(var i = 0; i < count; i++) {
    values[i] = '' + i;
  }
  return values;
}

global.values10 = makeValues(10);
global.values10K = makeValues(10000);
global.values10K1 = makeValues(10001);
global.values100K = makeValues(100000);
global.values1M = makeValues(1000000);

global.CList10 = List.of(values10);
global.CList10K = List.of(values10K);
global.CList10K1 = List.of(values10K1);
global.CList100K = List.of(values100K);
global.IList10 = Immutable.List(values10);
global.IList10K = Immutable.List(values10K);
global.IList10K1 = Immutable.List(values10K1);
global.IList100K = Immutable.List(values100K);

const Benchmark = require('benchmark');

var suite = new Benchmark.Suite()
  // .add('Collectable.List.of() [array of 1000000 values]', () => List.of(values1M))
  // .add('Collectable.List.of() [array of 10000 values]', () => List.of(values10K))
  // .add('Collectable.List#append() [10000 values, 1 at a time]', () => {
  //   var list = List.empty();
  //   for(var i = 0; i < 10000; i++) {
  //     list = list.append(i);
  //   }
  // })
  // .add('Collectable.List#prepend() [10000 values, 1 at a time]', () => {
  //   var list = List.empty();
  //   for(var i = 0; i < 10000; i++) {
  //     list = list.prepend(i);
  //   }
  // })
  // .add('Collectable.List#get() [100000 values, 1 at a time]', () => {
  //   for(var i = 0; i < 100000; i++) {
  //     CList100K.get(i);
  //   }
  // })
  // .add('Collectable.List#[Symbol.iterator]() [10 values]', () => {
  //   for(var x of CList10);
  // })
  // .add('Collectable.List#[Symbol.iterator]() [100000 values]', () => {
  //   for(var x of CList100K);
  // })
  // .add('Collectable.List#toArray() [10 values]', () => {
  //   CList10.toArray();
  // })
  // .add('Collectable.List#toArray() [100000 values]', () => {
  //   CList100K.toArray();
  // })
  .add('Collectable.List#concat() [10000 + 10001]', () => {
    CList10K.concat(CList10K1);
  })
  // .add('Collectable.List#slice() [10000 elements, 4 ranges]', () => {
  //   CList10K.slice(0, 4);
  //   CList10K.slice(9950);
  //   CList10K.slice(371, 9137);
  //   // CList10K.slice(1024, 1028);
  // })
  // .add('Immutable.List() [array of 1000000 values]', () => Immutable.List(values1M))
  // .add('Immutable.List() [array of 10000 values]', () => Immutable.List(values10K))
  // .add('Immutable.List#push() [10000 values, 1 at a time]', () => {
  //   var list = Immutable.List();
  //   for(var i = 0; i < 10000; i++) {
  //     list = list.push(i);
  //   }
  // })
  // .add('Immutable.List#unshift() [10000 values, 1 at a time]', () => {
  //   var list = Immutable.List();
  //   for(var i = 0; i < 10000; i++) {
  //     list = list.unshift(i);
  //   }
  // })
  // .add('Immutable.List#get() [100000 values, 1 at a time]', () => {
  //   for(var i = 0; i < 100000; i++) {
  //     IList100K.get(i);
  //   }
  // })
  // .add('Immutable.List#[Symbol.iterator]() [10 values]', () => {
  //   for(var x of IList10);
  // })
  // .add('Immutable.List#[Symbol.iterator]() [100000 values]', () => {
  //   for(var x of IList100K);
  // })
  // .add('Immutable.List#toArray() [10 values]', () => {
  //   IList10.toArray();
  // })
  // .add('Immutable.List#toArray() [100000 values]', () => {
  //   IList100K.toArray();
  // })
  .add('Immutable.List#concat() [10000 + 10001]', () => {
    IList10K.concat(IList10K1);
  })
  // .add('Immutable.List#slice() [10000 elements, 4 ranges]', () => {
  //   IList10K.slice(0, 4);
  //   IList10K.slice(9950);
  //   IList10K.slice(371, 9137);
  //   // IList10K.slice(1024, 1028);
  // })
  .on('error', event => console.log(event))
  .on('cycle', event => console.log(String(event.target)))
  // .on('complete', function() { console.log('Fastest is ' + this.filter('fastest').map('name')); })
  .run({ 'async': false });
