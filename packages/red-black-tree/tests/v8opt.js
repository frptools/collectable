/*
node --trace_opt --trace_deopt --allow-natives-syntax --trace-inlining v8opt.js
nodemon -w v8opt.js -- --trace_opt --trace_deopt --allow-natives-syntax --trace-inlining v8opt.js
- OR -
node --trace_opt --trace_deopt --allow-natives-syntax --trace-inlining --trace-turbo --turbo-filter=answer v8opt.js > perf.log
*/

// var {empty, set} = require('../../../.build/packages/red-black-tree/src');
// var {RedBlackTree, findPath, rebalance, setChild, createTree} = require('../../../.build/packages/red-black-tree/src/internals');

// const unsortedValues = [4740, 7125, 672, 6864, 7232, 8875, 7495, 8161, 706, 2533, 1570, 7568, 1658, 450, 3646,
//   8034, 6831, 4674, 1228, 5217, 3609, 571, 5135, 4869, 3755, 2713, 3391, 6, 1485, 9219, 8730, 3536, 4517, 8427, 4495,
//   662, 4847, 7866, 2077, 8586, 9128, 6287, 2999, 5173, 1363, 5836, 4990, 4419, 6125, 69, 4041, 9093, 9384, 6520, 2298,
//   344, 7155, 778, 229, 3401, 517, 4669, 5113, 1691, 9551, 3437, 3275, 9289, 7670, 9532, 5648, 5797, 5517, 3488, 8343,
//   8169, 415, 1564, 2984, 2062, 8060, 6886, 3761, 2701, 7673, 8894, 958, 8988, 954, 5049, 8058, 4040, 3276, 5679, 2021,
//   7666, 9599, 4348, 1207, 8591, 2480, 7452, 4048, 3350, 6531, 9771, 7748, 7315, 471, 353, 8512, 8691, 7810, 7611, 4594,
//   2551, 4933, 897, 4208, 9691, 1571, 3572, 5834, 6966, 7691, 188, 5525, 2829, 452, 2837, 9508, 6705, 3976, 6027, 9491,
//   9010, 3736, 1112, 2863, 6673, 3999, 9411, 3469, 6542, 8632, 2652, 4646, 4734, 5143, 9605, 3555, 3778, 9938, 1788,
//   1015, 7383, 6301, 3550, 9054, 1476, 4232, 5886, 4753, 1323, 3821, 2758, 3310, 7807, 7991, 6722, 6519, 3861, 539,
//   5478, 8590, 1387, 4249, 3890, 2715, 85, 6190, 307, 8323, 6570, 8780, 1991, 666, 3670, 7111, 8870, 2724, 1501, 7725,
//   4163, 6324, 3389, 3673, 4573, 3042, 8176, 6589, 5589, 9507, 3834, 8033, 9354, 5791, 2174, 1975, 9273, 7823, 1137,
//   3233, 5851, 9226, 3747, 3794, 5777, 6643, 1832, 9328, 9939, 1333, 7206, 4235, 3253, 462, 8501, 8272, 4664, 8953, 442,
//   8931, 7679, 9221, 2894, 948, 4807, 9861, 7630, 5891, 8182];

function createFunction1(y) {
  var fn = Function(`return function fn1(x) { return ${y} + x; }`)();
  fn(0);
  fn(0);
  return fn;
}

function createFunction2(y) {
  var fn = eval(`(function fn2(x) { return ${y} + x; })`);
  fn(0);
  fn(0);
  return fn;
}

function runFunction1(fn) {
  var n = 0;
  for(var i = 0; i < 1000; i++) {
    n += fn(Math.random());
  }
  return n;
}

function runFunction2(fn) {
  var n = 0;
  for(var i = 0; i < 1000; i++) {
    n += fn(Math.random());
  }
  return n;
}

function entryPoint() {
  var fn1 = createFunction1(Math.random());
  var fn2 = createFunction2(Math.random());
  %OptimizeFunctionOnNextCall(fn1);
  %OptimizeFunctionOnNextCall(fn2);
  var n, m;
  try {
    n = runFunction1(fn1);
    m = runFunction2(fn2);
  }
  catch(e) {
    console.log(e);
    return [];
  }
  console.log(`${n}, ${m}`);
  return [fn1, fn2];
  // var tree = empty();
  // for(var i = 0; i < unsortedValues.length; i++) {
  //   var key = unsortedValues[i];
  //   tree = set(key, foo(i, 1), tree);
  // }
  // return tree;
}

function printStatus(fn) {
  if(!fn) return;
  switch (%GetOptimizationStatus(fn)) {
    case 1: console.log(`[${fn.name}] Function is optimized`); break;
    case 2: console.log(`[${fn.name}] Function is not optimized`); break;
    case 3: console.log(`[${fn.name}] Function is always optimized`); break;
    case 4: console.log(`[${fn.name}] Function is never optimized`); break;
    case 6: console.log(`[${fn.name}] Function is maybe deoptimized`); break;
    case 7: console.log(`[${fn.name}] Function is optimized by TurboFan`); break;
    default: console.log(`[${fn.name}] Unknown optimization status`); break;
  }
}

function foo(a, b) { return a + b; }

//Fill type-info
entryPoint();
// 2 calls are needed to go from uninitialized -> pre-monomorphic -> monomorphic
entryPoint();

%OptimizeFunctionOnNextCall(entryPoint);
%OptimizeFunctionOnNextCall(createFunction1);
%OptimizeFunctionOnNextCall(createFunction2);
%OptimizeFunctionOnNextCall(runFunction1);
%OptimizeFunctionOnNextCall(runFunction2);

//The next call
var [_fn1, _fn2] = entryPoint();

//Check
console.log('--------------------------------------------------');
[createFunction1, runFunction1, createFunction2, runFunction2, _fn1, _fn2].forEach(printStatus);
// [foo, empty, createTree, set, RedBlackTree].forEach(printStatus);
