const SINGULAR = 'SINGULAR'
const PLURAL = 'PLURAL'
const SINGULAR_CONTEXT = 'SINGULAR_CONTEXT'
const PLURAL_CONTEXT = 'PLURAL_CONTEXT'

const DEFAULTS = {
  component: {
    name: 'LocalizedString',
    singular: 'id',
    plural: 'idPlural',
    context: 'context',
    comment: 'comment',
    shortform: 'i18n',
  },
  function: [
    {
      type: SINGULAR,
      name: '_',
      singular: 0,
      validate: true,
    }, {
      type: PLURAL,
      name: '_n',
      singular: 0,
      plural: 1,
      validate: true,
    }, {
      type: SINGULAR_CONTEXT,
      name: '_c',
      singular: 0,
      context: 1,
      validate: true,
    }, {
      type: PLURAL_CONTEXT,
      name: '_nc',
      singular: 0,
      plural: 1,
      context: 3,
      validate: true,
    },
  ],
}

function getFunctionOptions (state) {
  const opts = Object.assign({}, DEFAULTS, state.opts)
  opts.function.forEach(f => {
    if (!f.hasOwnProperty('validate')) {
      f.validate = true
    }
  })
  return opts.function
}

function getComponentOptions (state) {
  return Object.assign({}, DEFAULTS.component, (state.opts || {}).component)
}

module.exports = {
  getSingularFunction: (state, funcName) =>
    getFunctionOptions(state).find(func => func.type === SINGULAR && func.name === funcName),

  getPluralFunction: (state, funcName) =>
    getFunctionOptions(state).find(func => func.type === PLURAL && func.name === funcName),

  getSingularContextFunction: (state, funcName) =>
    getFunctionOptions(state).find(func => func.type === SINGULAR_CONTEXT && func.name === funcName),

  getPluralContextFunction: (state, funcName) =>
    getFunctionOptions(state).find(func => func.type === PLURAL_CONTEXT && func.name === funcName),

  getComponentName: state => getComponentOptions(state).name,

  getSingularAttribute: state => getComponentOptions(state).singular,

  getPluralAttribute: state => getComponentOptions(state).plural,

  getContextAttribute: state => getComponentOptions(state).context,

  getCommentAttribute: state => getComponentOptions(state).comment,

  getShortFormAttribute: state => getComponentOptions(state).shortform,
}
