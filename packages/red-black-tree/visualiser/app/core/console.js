var colors = {
  0: ['white', '#7fbad8', '#0075b2'],
  1: ['white', '#91a0ce', '#24429e'],
  2: ['white', '#ab86e0', '#570ec1'],
  3: ['white', '#c693cb', '#8d2798'],
  4: ['white', '#e17fa2', '#c30045'],
  5: ['white', '#ee8c7f', '#de1900'],
  6: ['white', '#eeb27f', '#de6500'],
  7: ['black', '#6f4900', '#de9200'],
  8: ['black', '#6f5f00', '#debe00'],
  9: ['black', '#6c7200', '#d9e400'],
  10: ['white', '#b8e08d', '#72c11b'],
  11: ['white', '#94d4a9', '#2aaa54'],
  12: ['black', '#797a7a', '#f2f4f4'],
  13: ['black', '#333339', '#676773'],
  main: i => colors[Math.abs(i)][2],
  inverse: i => colors[Math.abs(i)][0],
  mid: i => colors[Math.abs(i)][1],
};

function colorText(i, mid = false) {
  return {color: mid ? colors.mid(i) : colors.main(i)};
}

function colorFill(i, mid = false) {
  return {color: mid ? colors.mid(i) : colors.inverse(i), 'background-color': colors.main(i)};
}

function colorFillInv(i, mid = false) {
  return {color: mid ? colors.mid(i) : colors.main(i), 'background-color': colors.inverse(i)};
}

function hashString(str) {
  var hash = 5381, i = str.length;
  while(i) hash = (hash * 33) ^ str.charCodeAt(--i);
  return hash >>> 0;
}

function safe(id) {
  return typeof id === 'symbol'
    ? id.toString().substr(7, id.toString().length - 8)
    : id;
}

const colorWheelSize = 12;
function chooseStyle(id, textOnly) {
  var number;
  if(id === null || id === void 0) number = 0;
  else if(typeof id !== 'number') number = hashString(safe(id));
  else number = id;
  var index = number % colorWheelSize;
  var isMid = number % (colorWheelSize*2) > colorWheelSize;
  return textOnly ? colorText(index, isMid) : colorFill(index, isMid);
}

export function writeLogs(state) {
  if(state.logs.length > 0) {
    state.logs.forEach(logs => {
      if(typeof logs[0] === 'string') {
        var match = /^\[([A-Za-z0-9]+)(([#\.])\s*([_A-Za-z0-9]+)?)?\s*(\([^\)]+\))?\]/.exec(logs[0]);
        if(match) {
          var msg = '%c] ';
          var prmLogs = [];
          var tail = logs[0].substr(match[0].length);
          var prmsRx = /^\s*([a-z0-9]+?): ([a-z0-9_]+)(, )?/i;
          var prmsMatch = prmsRx.exec(tail);
          if(prmsMatch) {
            do {
              tail = tail.substr(prmsMatch[0].length);
              msg += `%c${prmsMatch[1]}%c: %c${prmsMatch[2]}%c${prmsMatch[3]||' '}`;
              prmLogs.push('color: #999', '' , 'color: white', '');
              prmsMatch = prmsRx.exec(tail);
            }
            while(prmsMatch);
          }
          logs = [''].concat(prmLogs, logs.slice(1));
          msg += tail.replace(/^\s+/, '');
          if(match[5]) {
            msg = ` %c${match[5]}${msg}`;
            logs.unshift('color: white');
          }
          if(match[4]) {
            msg = `%c${match[3]}%c${match[4]}${msg}`;
            logs.unshift('color: #999', 'color: #f06');
          }
          msg = `[%c${match[1]}${msg}`;
          logs.unshift(msg, match[3] ? 'color: orange' : 'color: #f06');
        }
      }
      console.log.apply(console, logs);
    });
  }
  console.debug(`# VERSION INDEX ${state.index}${state.label ? `: ${state.label}` : ''}`);
}