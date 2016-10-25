var now = require('performance-now');

function run(fn, values, n) {
  var value;
  for(var start = now(), result = 0, i = 0; i < n; i++) {
    value = values[i%5];
    result = fn(value)[i%value.length];
  }
  var t = now() - start;
  return n/t;
}

function compare(n, init, fns) {
  var values = [];
  for(var i = 0; i < 5; i++) {
    values.push(init());
  }
  run(fns[fns.length-1], values, n);
  console.log('RUN A:');
  for(var i = 0; i < fns.length; i++) {
    var t = run(fns[i], values, n);
    console.log(`#${i+1}: ${t} ops/ms, ${t*1000} ops/sec`);
  }

  console.log('RUN B:');
  for(var i = 0; i < fns.length; i++) {
    var t = run(fns[i], values, n);
    console.log(`#${i+1}: ${t} ops/ms, ${t*1000} ops/sec`);
  }

  console.log('RUN C:');
  for(var i = fns.length - 1; i >= 0; i--) {
    var t = run(fns[i], values, n);
    console.log(`#${i+1}: ${t} ops/ms, ${t*1000} ops/sec`);
  }

  console.log('RUN D:');
  for(var i = fns.length - 1; i >= 0; i--) {
    var t = run(fns[i], values, n);
    console.log(`#${i+1}: ${t} ops/ms, ${t*1000} ops/sec`);
  }
}

function init(n) {
  var arr = new Array(n);
  for(var i = 0, arr = []; i < n; arr[i] = {x:Math.random()}, i++);
  return arr;
}

var functions = [
  function(value) {
    switch(value.length) {
      case 0: return [];
      case 1:  return [value[0]];
      case 2:  return [value[0], value[1]];
      case 3:  return [value[0], value[1], value[2]];
      case 4:  return [value[0], value[1], value[2], value[3]];
      case 5:  return [value[0], value[1], value[2], value[3], value[4]];
      case 6:  return [value[0], value[1], value[2], value[3], value[4], value[5]];
      case 7:  return [value[0], value[1], value[2], value[3], value[4], value[5], value[6]];
      default:
        var arr = new Array(value.length);
        for(var i = 0; i < value.length; i++) {
          arr[i] = value[i];
        }
        return arr;
    }
  },
  function(value) {
    if(value.length > 7) {
      var arr = new Array(value.length);
      for(var i = 0; i < value.length; i++) {
        arr[i] = value[i];
      }
      return arr;
    }
    switch(value.length) {
      case 0: return [];
      case 1:  return [value[0]];
      case 2:  return [value[0], value[1]];
      case 3:  return [value[0], value[1], value[2]];
      case 4:  return [value[0], value[1], value[2], value[3]];
      case 5:  return [value[0], value[1], value[2], value[3], value[4]];
      case 6:  return [value[0], value[1], value[2], value[3], value[4], value[5]];
      case 7:  return [value[0], value[1], value[2], value[3], value[4], value[5], value[6]];
      default: return arr.slice();
    }
  },
  function(value) {
    var arr = new Array(value.length);
    for(var i = 0; i < value.length; i++) {
      arr[i] = value[i];
    }
    return arr;
  },
  function(value) {
    var arr = [];
    for(var i = 0; i < value.length; i++) {
      arr.push(value[i]);
    }
    return arr;
  },
  function(value) {
    return value.slice();
  }
];

(function() {
  console.log('--- #1 ---')
  compare(2000000, () => init(1), functions);
  console.log('--- #3 ---')
  compare(2000000, () => init(3), functions);
  console.log('--- #16 ---')
  compare(1000000, () => init(16), functions);
  console.log('--- #32 ---')
  compare(500000, () => init(32), functions);
  console.log('--- #1000 ---')
  compare(100000, () => init(1000), functions);
  console.log('--- #10000 ---')
  compare(50000, () => init(10000), functions);
  console.log('--- #100000 ---')
  compare(5000, () => init(100000), functions);
  console.log('--- #1048576 ---')
  compare(200, () => init(1048576), functions);
})();
