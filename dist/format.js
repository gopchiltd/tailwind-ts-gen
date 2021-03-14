"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatCode = formatCode;

var log = _interopRequireWildcard(require("cli-tag-logger"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// eslint-disable-next-line import/no-extraneous-dependencies
async function formatCode(code, outputFilename, prettierConfig) {
  let prettier;

  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    prettier = require('prettier');
  } catch (error) {
    if (prettierConfig) {
      log.print(log.warn`--prettier-config options was specified, but prettier packages was not found in node_modules.`);
      log.print(log.warn`Install prettier with npm/yarn in order to format code.`);
    }

    return code;
  }

  const config = await prettier.resolveConfig(prettierConfig || outputFilename);
  return prettier.format(code, { ...config,
    parser: /\.tsx?/.test(outputFilename) ? 'typescript' : 'babel'
  });
}
//# sourceMappingURL=format.js.map