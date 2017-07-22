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
    }, {
      type: PLURAL,
      name: '_n',
      singular: 0,
      plural: 1,
    }, {
      type: SINGULAR_CONTEXT,
      name: '_c',
      singular: 0,
      context: 1,
    }, {
      type: PLURAL_CONTEXT,
      name: '_nc',
      singular: 0,
      plural: 1,
      context: 3,
    },
  ],
}

function getFunctionOptions (state) {
  return Object.assign({}, DEFAULTS, state.opts).function
}

function getComponentOptions (state) {
  return Object.assign({}, DEFAULTS.component, (state.opts || {}).component)
}

module.exports = {
  getSingularFunction: state => getFunctionOptions(state).filter(func => func.type === SINGULAR)[0],

  getPluralFunction: state => getFunctionOptions(state).filter(func => func.type === PLURAL)[0],

  getSingularContextFunction: state => getFunctionOptions(state)
    .filter(func => func.type === SINGULAR_CONTEXT)[0],

  getPluralContextFunction: state => getFunctionOptions(state)
    .filter(func => func.type === PLURAL_CONTEXT)[0],

  getComponentName: state => getComponentOptions(state).name,

  getSingularAttribute: state => getComponentOptions(state).singular,

  getPluralAttribute: state => getComponentOptions(state).plural,

  getContextAttribute: state => getComponentOptions(state).context,

  getCommentAttribute: state => getComponentOptions(state).comment,

  getShortFormAttribute: state => getComponentOptions(state).shortform,
}
