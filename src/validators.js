const {
  getComponentName,
  getSingularAttribute,
  getShortFormAttribute,
} = require('./arguments')

module.exports = {
  validateComponentEntry (entry, types, path, state) {
    if (!entry.msgid && !entry.isShortForm) {
      throw path.buildCodeFrameError(
        `${getComponentName(state)} component must have a prop '${getSingularAttribute(state)}' or '${getShortFormAttribute(state)}'!`)
    }
  },
}
