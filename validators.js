const {
  getComponentName,
  getSingularAttribute,
} = require('./arguments');

module.exports = {
  validateFuncArg(arg, argIndex, funcName, types, path) {
    if (!types.isStringLiteral(arg)) {
      throw path.buildCodeFrameError(
        `Function ${funcName} must have a String literal for argument #${argIndex + 1}!`);
    }

    return arg.value;
  },

  validateComponentEntry(entry, types, path, state) {
    if (!entry.msgid) {
      throw path.buildCodeFrameError(
        `${getComponentName(state)} component must have a prop ${getSingularAttribute(state)} for singular form!`);
    }
  },
};
