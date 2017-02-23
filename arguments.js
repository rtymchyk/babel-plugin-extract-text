const SINGULAR = 'SINGULAR';
const PLURAL = 'PLURAL';
const SINGULAR_CONTEXT = 'SINGULAR_CONTEXT';
const PLURAL_CONTEXT = 'PLURAL_CONTEXT';

const DEFAULTS = {
  component: {
    name: 'LocalizedString',
    singular: 'id',
    plural: 'idPlural',
    context: 'context',
    comment: 'comment',
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
};

function getFunctionOptions(state) {
  return Object.assign({}, DEFAULTS, state.opts).function;
}

function getComponentOptions(state) {
  return Object.assign({}, DEFAULTS.component, (state.opts || {}).component);
}

module.exports = {
  getSingularFunction: state => {
    return getFunctionOptions(state).filter(func => func.type === SINGULAR)[0];
  },

  getPluralFunction: state => {
    return getFunctionOptions(state).filter(func => func.type === PLURAL)[0];
  },

  getSingularContextFunction: state => {
    return getFunctionOptions(state).filter(func => func.type === SINGULAR_CONTEXT)[0];
  },

  getPluralContextFunction: state => {
    return getFunctionOptions(state).filter(func => func.type === PLURAL_CONTEXT)[0];
  },

  getComponentName: state => {
    return getComponentOptions(state).name;
  },

  getSingularAttribute: state => {
    return getComponentOptions(state).singular;
  },

  getPluralAttribute: state => {
    return getComponentOptions(state).plural;
  },

  getContextAttribute: state => {
    return getComponentOptions(state).context;
  },

  getCommentAttribute: state => {
    return getComponentOptions(state).comment;
  },
};
