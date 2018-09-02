/* eslint-disable camelcase */
const {
  getSingularFunction,
  getSingularContextFunction,
  getPluralFunction,
  getPluralContextFunction,
  getComponentName,
  getSingularAttribute,
  getPluralAttribute,
  getContextAttribute,
  getCommentAttribute,
  getShortFormAttribute,
} = require('./arguments')

const {
  validateComponentEntry,
} = require('./validators')

const {
  extractFuncArg,
} = require('./extractors')

const DEFAULT_CHARSET = 'UTF-8'
const DEFAULT_HEADERS = {
  'content-type': 'text/plain; charset=UTF-8',
  'plural-forms': 'nplurals=2; plural=(n!=1);',
  language: 'en_US',
}

function buildSingularEntry (args, types, path, func) {
  const msgid = args[func.singular]

  return {
    msgid: extractFuncArg(msgid, func.singular, func.name, types, path),
  }
}

function buildSingularContextEntry (args, types, path, func) {
  const msgid = args[func.singular]
  const msgctxt = args[func.context]

  return {
    msgid: extractFuncArg(msgid, func.singular, func.name, types, path),
    msgctxt: extractFuncArg(msgctxt, func.context, func.name, types, path),
  }
}

function buildPluralEntry (args, types, path, func) {
  const msgid = args[func.singular]
  const msgid_plural = args[func.plural]

  return {
    msgid: extractFuncArg(msgid, func.singular, func.name, types, path),
    msgid_plural: extractFuncArg(msgid_plural, func.plural, func.name, types, path),
  }
}

function buildPluralContextEntry (args, types, path, func) {
  const msgid = args[func.singular]
  const msgid_plural = args[func.plural]
  const msgctxt = args[func.context]

  return {
    msgid: extractFuncArg(msgid, func.singular, func.name, types, path),
    msgid_plural: extractFuncArg(msgid_plural, func.plural, func.name, types, path),
    msgctxt: extractFuncArg(msgctxt, func.context, func.name, types, path),
  }
}

function mergeReference (existingReference, newReference) {
  if (existingReference) {
    if (existingReference.includes(newReference)) {
      return existingReference
    }

    return `${existingReference}\n${newReference}`
  }

  return newReference
}

function mergePlural (existingPlural, newPlural) {
  if (existingPlural) return existingPlural
  return newPlural
}

function mergeExtracted (existingExtracted, newExtracted) {
  if (existingExtracted) return existingExtracted
  return newExtracted
}

function mergeTranslation (existingTranslation, newTranslation) {
  if (existingTranslation && existingTranslation.length === 2) {
    return existingTranslation
  }
  return newTranslation
}

function buildReference (entry, state) {
  if (entry && state.opts.includeReference) {
    const rawFilename = state.file.opts.filename
    const baseDirRaw = state.opts.baseDir

    if (baseDirRaw) {
      const baseDir = `/${baseDirRaw.replace('/', '')}/`
      const baseDirIndex = rawFilename.indexOf(baseDir)

      if (baseDirIndex !== -1) {
        entry.reference = rawFilename.substr(
          baseDirIndex + baseDir.length, rawFilename.length)
        return entry
      }
    }

    entry.reference = rawFilename
  }

  return entry
}

module.exports = {
  buildCallExpressionEntry (types, path, state) {
    const args = path.node.arguments
    const callee = path.node.callee.name
    let entry
    let func
    try {
      func = getSingularFunction(state, callee)
      if (func) {
        entry = buildSingularEntry(args, types, path, func)
        return buildReference(entry, state)
      }

      func = getSingularContextFunction(state, callee)
      if (func) {
        entry = buildSingularContextEntry(args, types, path, func)
        return buildReference(entry, state)
      }

      func = getPluralFunction(state, callee)
      if (func) {
        entry = buildPluralEntry(args, types, path, func)
        return buildReference(entry, state)
      }

      func = getPluralContextFunction(state, callee)
      if (func) {
        entry = buildPluralContextEntry(args, types, path, func)
        return buildReference(entry, state)
      }
    } catch (error) {
      if (!func) throw error
      if (!func.ignoreError) throw error
    }
  },

  buildJSXElementEntry (types, path, state) {
    const element = path.node.openingElement

    if (element.name.name === getComponentName(state)) {
      const entry = {}

      element.attributes.forEach((attribute) => {
        const attributeName = attribute.name.name
        const attributeValue = attribute.value.value

        switch (attributeName) {
          case getSingularAttribute(state):
            entry.msgid = attributeValue
            break
          case getPluralAttribute(state):
            entry.msgid_plural = attributeValue
            break
          case getContextAttribute(state):
            entry.msgctxt = attributeValue
            break
          case getCommentAttribute(state):
            entry.extracted = attributeValue
            break
          case getShortFormAttribute(state):
            entry.isShortForm = true
            break
          default:
            break
        }
      })

      validateComponentEntry(entry, types, path, state)
      if (entry.isShortForm) return null

      return buildReference(entry, state)
    }

    return null
  },

  mergeEntries (args, entries) {
    const data = {
      charset: args.charset || DEFAULT_CHARSET,
      headers: Object.assign({}, DEFAULT_HEADERS, args.headers),
      translations: {},
    }

    entries.forEach((entry) => {
      const { msgid, msgid_plural, msgctxt, extracted, reference } = entry
      const context = entry.msgctxt || ''

      const existingContext = data.translations[context]
      if (!existingContext) data.translations[context] = {}

      const existingEntry = data.translations[context][msgid]
      if (!existingEntry) data.translations[context][msgid] = {}

      const existingReference = data.translations[context][msgid].comments &&
        data.translations[context][msgid].comments.reference

      const existingPlural = data.translations[context][msgid].msgid_plural
      const existingExtracted = data.translations[context][msgid].comments &&
        data.translations[context][msgid].comments.extracted

      const existingTranslation = data.translations[context][msgid].msgstr

      data.translations[context][msgid] = {
        msgid,
        msgctxt,
        msgstr: mergeTranslation(existingTranslation, msgid_plural ? ['', ''] : ['']),
        msgid_plural: mergePlural(existingPlural, msgid_plural),
        comments: {
          reference: mergeReference(existingReference, reference),
          extracted: mergeExtracted(existingExtracted, extracted),
        },
      }
    })

    return data
  },

  buildReference,
}
