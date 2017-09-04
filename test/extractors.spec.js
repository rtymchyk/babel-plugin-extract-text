import {
  extractFuncArg,
} from 'extractors'

describe('validators', () => {
  const isStringLiteral = jest.fn((arg) => !arg.left && !arg.right)
  const isBinaryExpression = jest.fn((arg) => arg.left && arg.right)
  const path = {
    buildCodeFrameError: jest.fn(),
  }

  beforeEach(() => {
    path.buildCodeFrameError.mockReset()
    isStringLiteral.mockClear()
    isBinaryExpression.mockClear()
  })

  describe('#extractFuncArg', () => {
    it('returns arg value if arg is a String literal', () => {
      const value = extractFuncArg({ value: 'Hello' }, 0, '_', {
        isStringLiteral: jest.fn(() => true),
      }, path)

      expect(value).toBe('Hello')
    })

    it('returns concatenated value if arg is a Binary Expression', () => {
      const value = extractFuncArg({
        operator: '+',
        left: {
          value: 'Hello, ',
        },
        right: {
          operator: '+',
          left: {
            value: 'Bob. ',
          },
          right: {
            value: 'You are great.',
          },
        },
      }, 0, '_', {
        isStringLiteral,
        isBinaryExpression,
      }, path)

      expect(value).toBe('Hello, Bob. You are great.')
    })

    it('throws error if arg is not a String Literal or Binary Exression', (done) => {
      try {
        extractFuncArg({ value: 1, type: 'Identifier' }, 0, '_', {
          isStringLiteral: jest.fn(() => false),
          isBinaryExpression: jest.fn(() => false),
        }, path)
      } catch (error) {
        expect(path.buildCodeFrameError).toHaveBeenCalledWith(
          'Function _ must have a String Literal or Binary Expression for argument #1, found Identifier instead!')
        done()
      }
    })

    it('throws error if Binary Expression is not using the + operator', (done) => {
      try {
        extractFuncArg({
          operator: '-',
          left: {
            value: 'Hello, ',
          },
          right: {
            value: 'Bob.',
          },
        }, 0, '_', {
          isStringLiteral,
          isBinaryExpression,
        }, path)
      } catch (error) {
        expect(path.buildCodeFrameError).toHaveBeenCalledWith(
          "Function _ must use the '+' operator for string concatenation for argument #1, found - instead!")
        done()
      }
    })
  })
})
