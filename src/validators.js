const {
  getComponentName,
  getSingularAttribute,
  getShortFormAttribute,
} = require('./arguments')

module.exports = {
  validateFuncArg (arg, argIndex, funcName, types, path) {
    if (!types.isStringLiteral(arg)) {
      throw path.buildCodeFrameError(
        `Function ${funcName} must have a String literal for argument #${argIndex + 1}, found ${arg.type} instead!`)
    }

    return arg.value
  },

  validateComponentEntry (entry, types, path, state) {
    if (!entry.msgid && !entry.isShortForm) {
      throw path.buildCodeFrameError(
        `${getComponentName(state)} component must have a prop '${getSingularAttribute(state)}' or '${getShortFormAttribute(state)}'!`)
    }
  },
}
