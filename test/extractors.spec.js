import {
  extractFuncArg,
} from 'extractors'

describe('validators', () => {
  const path = {
    buildCodeFrameError: jest.fn(),
  }

  beforeEach(() => {
    path.buildCodeFrameError.mockReset()
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
        isStringLiteral: jest.fn((arg) => {
          if (!arg.left && !arg.right) return true
        }),
        isBinaryExpression: jest.fn((arg) => {
          if (arg.left && arg.right) return true
        }),
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
  })
})
