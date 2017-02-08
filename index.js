/* eslint-disable camelcase */
const gettextParser = require('gettext-parser');
const fs = require('fs');

const PLUGIN_KEY = process.env.NODE_ENV === 'test'
  ? './index.js' : 'babel-extract-gettext';
const DEFAULT_OUTPUT_FILE = 'strings.po';

const {
  buildCallExpressionEntry,
  buildJSXElementEntry,
  mergeEntries,
} = require('./builders');

function addReference(entry, state) {
  entry.reference = state.file.opts.filename;
  return entry;
}

module.exports = ({ types }) => {
  const entries = [];

  return {
    visitor: {
      CallExpression(path, state) {
        const entry = buildCallExpressionEntry(types, path, state);
        if (entry) entries.push(addReference(entry, state));
      },
      JSXElement(path, state) {
        const entry = buildJSXElementEntry(types, path, state);
        if (entry) entries.push(addReference(entry, state));
      },
    },
    post(state) {
      const thisPlugin = state.opts.plugins.filter(plugin => {
        return plugin[0].key === PLUGIN_KEY;
      })[0];
      const args = thisPlugin[1] || {};
      const file = args.outputFile || DEFAULT_OUTPUT_FILE;
      const data = mergeEntries(args, entries);
      const po = gettextParser.po.compile(data);

      fs.writeFileSync(file, po);
    },
  };
};
