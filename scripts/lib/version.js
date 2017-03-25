function versionOf(item) {
  return item && item.version || '0.0.0';
}

function compareVersions(a, b) {
  var a0 = a.split('.');
  var b0 = b.split('.');
  if(a0[0] !== b0[0]) return parseInt(a0[0]) - parseInt(b0[0]);
  if(a0[1] !== b0[1]) return parseInt(a0[1]) - parseInt(b0[1]);
  if(a0[2] !== b0[2]) {
    var a1 = parseInt(a0[2]);
    var b1 = parseInt(b0[2]);
    if(isNaN(a1) || isNaN(b1)) return String.localeCompare(a0[2], b0[2]);
    return a1 - b1;
  }
  return 0;
}

function bumpVersion(part, version) {
  const parts = version.split('.').map(v => parseInt(v));
  switch(part) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
  }
  return parts.join('.');
}

module.exports = {
  versionOf,
  compareVersions,
  bumpVersion
};