"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseClassname = parseClassname;
exports.getIdFromClassname = getIdFromClassname;

function parseClassname(classname) {
  const [base, ...modifiers] = classname.split(':').reverse();
  const isNegative = base[0] === '-';
  const id = (isNegative ? base.slice(1) : base).replace('sr-only', 'srOnly').replace('no-underline', 'noUnderline').replace('no-wrap', 'noWrap').replace('no-repeat', 'noRepeat');
  const words = id.split('-');

  if (isNegative) {
    words.unshift('neg');
  }

  return {
    classname,
    names: words.map(word => word.replace('/', 'by')),
    modifiers: modifiers.reverse()
  };
}

function getIdFromClassname(classname) {
  const output = [...classname.modifiers, ...classname.names].join('_');
  return output === 'static' ? '_static' : output;
}
//# sourceMappingURL=parse.js.map