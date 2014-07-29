var inspect = require('util').inspect;
exports.fullInspect = function(o) { return inspect(o, {depth: null}); };

// Проверяет, точно ли переданный объект является строкой с uint64 в основании 36 
exports.isUint64InBase36 = function(s) {
  if (!isUintInBase36(s)) return false;
  return isUintInBase36LesserOrEqual(s, '3w5e11264sgsf');
};

exports.isUint128InBase36 = function(s) {
  if (!isUintInBase36(s)) return false;
  return isUintInBase36LesserOrEqual(s, 'f5lxx1zz5pnorynqglhzmsp33');
};

exports.isUintInBase36 = isUintInBase36;
function isUintInBase36(s) {
  if (typeof s !== 'string') return false;
  if (s.length === 0) return false;

  for (i = 0; i < s.length; i++) {
    if (!(('a' <= s[i] && s[i] <= 'z') || ('0' <= s[i] && s[i] <= '9'))) {
      return false;
    }
  }

  return true;
};

exports.isUintInBase36LesserOrEqual = isUintInBase36LesserOrEqual;
function isUintInBase36LesserOrEqual(a, b) {
  if (a.length > b.length) return false;
  if (a.length < b.length) return true;

  var i;
  for (i = 0; i < a.length; i++) {
    if (a[i] > b[i]) return false;
    else if (a[i] < b[i]) return true;
  }

  return true;
};
