"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractClassnames = extractClassnames;

var _postcss = _interopRequireDefault(require("postcss"));

var _postcssLoadConfig = _interopRequireDefault(require("postcss-load-config"));

var _postcssSelectorParser = _interopRequireDefault(require("postcss-selector-parser"));

var _path = require("path");

var _util = require("util");

var _fs = require("fs");

var log = _interopRequireWildcard(require("cli-tag-logger"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const readFileAsync = (0, _util.promisify)(_fs.readFile);

const extract = _postcss.default.plugin('postcss-extract-class', callback => {
  return root => {
    const parsedClassnames = [];
    root.walkRules(rule => {
      const classNodes = getClassNodesFromRule(rule);
      const classnames = classNodes.map(classNode => classNode.value).filter(Boolean);
      parsedClassnames.push(...classnames);
    });
    callback && callback(parsedClassnames);
  };
});

function getClassNodesFromRule(rule) {
  const classNodes = [];
  (0, _postcssSelectorParser.default)(selectors => {
    selectors.walkClasses(classNode => {
      classNodes.push(classNode);
    });
  }).processSync(rule);
  return classNodes;
}

async function extractClassnames(inputFilenames, postcssConfig = process.cwd()) {
  const config = await (0, _postcssLoadConfig.default)(undefined, postcssConfig);

  try {
    const classnames = await Promise.all(inputFilenames.map(async inputFilename => {
      const absInputFilename = (0, _path.isAbsolute)(inputFilename) ? inputFilename : (0, _path.resolve)(inputFilename);
      const relativeInputFilename = (0, _path.relative)(process.cwd(), absInputFilename);
      log.print(log.debug`Processing ${relativeInputFilename}`);
      const inputFile = await readFileAsync(absInputFilename, 'utf8');
      return new Promise((resolve, reject) => {
        (0, _postcss.default)([...config.plugins, extract(resolve)]).process(inputFile, { ...config.options,
          from: undefined
        }).then(results => {
          const warnings = results.warnings();
          log.print(log.debug`Extracted ${relativeInputFilename}`);

          if (warnings.length) {
            log.print(log.warn`${warnings}`);
          }

          return;
        }).catch(error => {
          reject(error);
        });
      });
    }));
    const flatClassnames = classnames.reduce((acc, cx) => {
      return acc.concat(...cx);
    }, []); // Remove duplicates

    return flatClassnames.filter((cx, index) => {
      return flatClassnames.indexOf(cx, index + 1) === -1;
    });
  } catch (error) {
    log.print(log.error`Class names extraction failed`);
    throw error;
  }
}
//# sourceMappingURL=extract.js.map