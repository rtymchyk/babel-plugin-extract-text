/* eslint-disable camelcase */
const gettextParser = require('gettext-parser')
const fs = require('fs')

const PLUGIN_KEY = process.env.NODE_ENV === 'test'
  ? './plugin.js' : 'extract-text'
const DEFAULT_OUTPUT_FILE = 'strings.po'

const {
  buildCallExpressionEntry,
  buildJSXElementEntry,
  mergeEntries,
} = require('./src/builders')

module.exports = ({ types }) => {
  return {
    pre (state) {
      this.entries = []
    },
    visitor: {
      CallExpression (path, state) {
        const entry = buildCallExpressionEntry(types, path, state)
        if (entry) this.entries.push(entry)
      },
      JSXElement (path, state) {
        const entry = buildJSXElementEntry(types, path, state)
        if (entry) this.entries.push(entry)
      },
    },
    post (state) {
      const thisPlugin = state.opts.plugins.filter(plugin => plugin[0].key === PLUGIN_KEY)[0]
      const args = thisPlugin[1] || {}
      const outputFile = args.outputFile || DEFAULT_OUTPUT_FILE
      const poRawData = mergeEntries(args, this.entries)
      const po = gettextParser.po.compile(poRawData)

      fs.writeFileSync(outputFile, po)
    },
  }
}
