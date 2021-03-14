"use strict";

var _yargs = _interopRequireDefault(require("yargs"));

var _dedent = _interopRequireDefault(require("dedent"));

var _extract = require("./extract");

var _parse = require("./parse");

var _format = require("./format");

var _path = require("path");

var _util = require("util");

var _fs = require("fs");

var log = _interopRequireWildcard(require("cli-tag-logger"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const writeFileAsync = (0, _util.promisify)(_fs.writeFile);

const argv = _yargs.default.scriptName('tw2ts').command('$0 <input...>', ['Generate file with Tailwind CSS class names.', 'If Prettier config file and Prettier package is available, it will be used to format the generated file.', '\n\n', 'You can pass multiple input files - class names from all of them, will be extracted to a single file specified by -o, --out option.'].join(' '), yargs => {
  yargs.positional('input', {
    description: 'CSS/SASS/LESS file with Tailwind CSS imports.',
    type: 'string'
  });
}).option('out', {
  alias: 'o',
  demandOption: true,
  description: 'Path to an output file with generated code.',
  type: 'string'
}).option('postcss-config', {
  description: 'Path to PostCSS config file.',
  type: 'string'
}).option('prettier-config', {
  description: 'Path to Prettier config file.',
  type: 'string'
}).help().argv;

process.on('uncaughtException', error => {
  log.print(log.error`Unhandled error ${error}`);
  process.exit(1);
});

(async () => {
  try {
    const outputFilename = (0, _path.isAbsolute)(argv.out) ? argv.out : (0, _path.resolve)(argv.out);
    log.print(log.info`Resolved output file to ${outputFilename}`);
    const classnames = await (0, _extract.extractClassnames)(argv.input, argv['postcss-config']);
    log.print(log.info`Found ${classnames.length} class names`);
    log.print(log.info`Parsing...`);
    const parsedClassnames = classnames.map(_parse.parseClassname);
    const classnameExports = `export default _classNames = ${parsedClassnames};`;
    log.print(log.info`Generating...`);
    let code = _dedent.default`
    /**
     * @file Tailwind CSS class names exported as const variables.
     *       Auto-generated file. Do not modify.
     * @author tailwind-ts-gen
     */

    ${classnameExports}
    `;
    code = await (0, _format.formatCode)(code, outputFilename, argv['prettier-config']);
    writeFileAsync(outputFilename, code);
    log.print(log.success`Done!`);
  } catch (error) {
    log.print(log.error`Unhandled error ${error}`);
    process.exit(1);
  }
})();
//# sourceMappingURL=cli.js.map