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
} = require('./arguments');

const {
  validateFuncArg,
  validateComponentEntry,
} = require('./validators');

const DEFAULT_CHARSET = 'UTF-8';
const DEFAULT_HEADERS = {
  'content-type': 'text/plain; charset=UTF-8',
  'plural-forms': 'nplurals=2; plural=(n!=1);',
  'language': 'en_US',
};

function buildSingularEntry(args, types, path, state) {
  const func = getSingularFunction(state);
  const msgid = args[func.singular];

  return {
    msgid: validateFuncArg(msgid, func.singular, func.name, types, path),
  };
}

function buildSingularContextEntry(args, types, path, state) {
  const func = getSingularContextFunction(state);
  const msgid = args[func.singular];
  const msgctxt = args[func.context];

  return {
    msgid: validateFuncArg(msgid, func.singular, func.name, types, path),
    msgctxt: validateFuncArg(msgctxt, func.context, func.name, types, path),
  };
}

function buildPluralEntry(args, types, path, state) {
  const func = getPluralFunction(state);
  const msgid = args[func.singular];
  const msgid_plural = args[func.plural];

  return {
    msgid: validateFuncArg(msgid, func.singular, func.name, types, path),
    msgid_plural: validateFuncArg(msgid_plural, func.plural, func.name, types, path),
  };
}

function buildPluralContextEntry(args, types, path, state) {
  const func = getPluralContextFunction(state);
  const msgid = args[func.singular];
  const msgid_plural = args[func.plural];
  const msgctxt = args[func.context];

  return {
    msgid: validateFuncArg(msgid, func.singular, func.name, types, path),
    msgid_plural: validateFuncArg(msgid_plural, func.plural, func.name, types, path),
    msgctxt: validateFuncArg(msgctxt, func.context, func.name, types, path),
  };
}

function mergeReference(existingReference, newReference) {
  if (existingReference) {
    if (existingReference.includes(newReference)) {
      return existingReference;
    }

    return `${existingReference}\n${newReference}`;
  }

  return newReference;
}

function mergePlural(existingPlural, newPlural) {
  if (existingPlural) return existingPlural;
  return newPlural;
}

function mergeExtracted(existingExtracted, newExtracted) {
  if (existingExtracted) return existingExtracted;
  return newExtracted;
}

function mergeTranslation(existingTranslation, newTranslation) {
  if (existingTranslation && existingTranslation.length === 2) {
    return existingTranslation;
  }
  return newTranslation;
}

module.exports = {
  buildCallExpressionEntry(types, path, state) {
    const args = path.node.arguments;
    const callee = path.node.callee.name;

    switch (callee) {
    case getSingularFunction(state).name:
      return buildSingularEntry(args, types, path, state);
    case getSingularContextFunction(state).name:
      return buildSingularContextEntry(args, types, path, state);
    case getPluralFunction(state).name:
      return buildPluralEntry(args, types, path, state);
    case getPluralContextFunction(state).name:
      return buildPluralContextEntry(args, types, path, state);
    default:
      break;
    }
  },

  buildJSXElementEntry(types, path, state) {
    const element = path.node.openingElement;

    if (element.name.name === getComponentName(state)) {
      const entry = {};

      element.attributes.forEach(attribute => {
        const attributeName = attribute.name.name;
        const attributeValue = attribute.value.value;

        switch (attributeName) {
        case getSingularAttribute(state):
          entry.msgid = attributeValue;
          break;
        case getPluralAttribute(state):
          entry.msgid_plural = attributeValue;
          break;
        case getContextAttribute(state):
          entry.msgctxt = attributeValue;
          break;
        case getCommentAttribute(state):
          entry.extracted = attributeValue;
          break;
        default:
          break;
        }
      });

      validateComponentEntry(entry, types, path, state);
      return entry;
    }
  },

  mergeEntries(args, entries) {
    const data = {
      charset: args.charset || DEFAULT_CHARSET,
      headers: Object.assign({}, DEFAULT_HEADERS, args.headers),
      translations: {},
    };

    entries.forEach(entry => {
      const { msgid, msgid_plural, msgctxt, extracted } = entry;
      const context = entry.msgctxt || '';
      const reference = args.includeReference
        ? entry.reference : undefined;

      const existingContext = data.translations[context];
      if (!existingContext) data.translations[context] = {};

      const existingEntry = data.translations[context][msgid];
      if (!existingEntry) data.translations[context][msgid] = {};

      const existingReference = data.translations[context][msgid].comments
        && data.translations[context][msgid].comments.reference;

      const existingPlural = data.translations[context][msgid].msgid_plural;
      const existingExtracted = data.translations[context][msgid].comments
        && data.translations[context][msgid].comments.extracted;

      const existingTranslation = data.translations[context][msgid].msgstr;

      data.translations[context][msgid] = {
        msgid,
        msgctxt,
        msgstr: mergeTranslation(existingTranslation, msgid_plural ? ['', ''] : ['']),
        msgid_plural: mergePlural(existingPlural, msgid_plural),
        comments: {
          reference: mergeReference(existingReference, reference),
          extracted: mergeExtracted(existingExtracted, extracted),
        },
      };
    });

    return data;
  },
};
