const format = require('string-format');

function maxLengths(array, select) {
  var max;
  for(var i = 0; i < array.length; i++) {
    var el = array[i];
    if(select) {
      el = select(el);
    }
    if(!el) continue;
    if(typeof el === 'object') {
      if(max === void 0) {
        max = {};
      }
      Object.keys(el).forEach(key => {
        max[key] = Math.max(max[key]||0, (el[key]||'').toString().length);
      });
    }
    else {
      max = (max || 0) + (el || '').toString().length;
    }
  }
  return max;
}

function padRight(str, width) {
  if(typeof str !== 'string') str = (str || '').toString();
  if(!width) new Array(width + 1).join(' ');
  if(str.length > width) return str.substr(0, width);
  while(str.length < width) str += ' ';
  return str;
}

function formatList(template, array, select, transform) {
  const max = maxLengths(array, select);
  const makeValues = item => {
    const data = select ? select(item) : item;
    var strings = Object.keys(data)
      .reduce((acc, key) => {
        let str = padRight(data[key], max[key]);
        if(transform) str = transform(key, str, data);
        acc[key] = str;
        return acc;
      }, {});
    return {strings, data};
  };
  return array.map(item => {
    const values = makeValues(item);
    const formatted = format(template, values.strings);
    return {item, strings: values.strings, data: values.data, formatted};
  });
}

function stripScopeName(name) {
  return name.replace(/^@[^\/]+\//, '');
}

module.exports = {
  maxLengths,
  padRight,
  formatList,
  stripScopeName
};