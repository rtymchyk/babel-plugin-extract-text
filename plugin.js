/* eslint-disable camelcase */
const gettextParser = require('gettext-parser')
const fs = require('fs')
const path = require('path')

const PLUGIN_KEY = process.env.NODE_ENV === 'test'
  ? 'plugin.js' : 'extract-text'
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
      if (this.entries.length === 0) return

      const thisPlugin = state.opts.plugins.find(plugin => plugin.key.includes(PLUGIN_KEY))
      const args = (thisPlugin || {}).options

      const filename = this.file.opts.filename || 'unknown'
      const currentFileName = path.basename(filename)
      const currentFileDir = path.dirname(filename)

      const outputFile = args.outputFile ||
        (filename !== 'unknown' && `${currentFileName}.po`) ||
        DEFAULT_OUTPUT_FILE
      const outputDir = args.outputDir || currentFileDir

      const poRawData = mergeEntries(args, this.entries)
      const po = gettextParser.po.compile(poRawData)

      fs.writeFileSync(path.join(outputDir, outputFile), po)
    },
  }
}
