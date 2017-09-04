function extractFuncArg (arg, argIndex, funcName, types, path) {
  if (types.isStringLiteral(arg)) {
    return arg.value
  } else if (types.isBinaryExpression(arg)) {
    if (arg.operator !== '+') {
      throw path.buildCodeFrameError(
        `Function ${funcName} must use the '+' operator for string concatenation ` +
        `for argument #${argIndex + 1}, found ${arg.operator} instead!`
      )
    }

    return extractFuncArg(arg.left, argIndex, funcName, types, path) +
      extractFuncArg(arg.right, argIndex, funcName, types, path)
  } else {
    throw path.buildCodeFrameError(
      `Function ${funcName} must have a String Literal or Binary Expression ` +
      `for argument #${argIndex + 1}, found ${arg.type} instead!`
    )
  }
}

module.exports = {
  extractFuncArg,
}
