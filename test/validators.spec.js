import {
  validateFuncArg,
  validateComponentEntry,
} from 'validators'

describe('validators', () => {
  const path = {
    buildCodeFrameError: jest.fn(),
  }

  beforeEach(() => {
    path.buildCodeFrameError.mockReset()
  })

  describe('#validateFuncArg', () => {
    it('returns arg value if arg is a String literal', () => {
      const value = validateFuncArg({ value: 'Hello' }, 0, '_', {
        isStringLiteral: jest.fn(() => true),
      }, path)

      expect(value).toBe('Hello')
    })

    it('throws error if arg is not a String literal', (done) => {
      try {
        validateFuncArg({ value: 1, type: 'Identifier' }, 0, '_', {
          isStringLiteral: jest.fn(() => false),
        }, path)
      } catch (error) {
        expect(path.buildCodeFrameError).toHaveBeenCalledWith(
          'Function _ must have a String literal for argument #1, found Identifier instead!')
        done()
      }
    })
  })

  describe('#validateComponentEntry', () => {
    const types = jest.fn()
    const state = jest.fn()

    it('does not throw error if contains singular form', () => {
      validateComponentEntry({ msgid: 'Hello' }, types, path, state)
    })

    it('does not throw error if contains shortform', () => {
      validateComponentEntry({ isShortForm: true }, types, path, state)
    })

    it('throws error if does not contain singular form nor shortform', (done) => {
      try {
        validateComponentEntry({ msgid_plural: 'Many' }, types, path, state)
      } catch (error) {
        expect(path.buildCodeFrameError).toHaveBeenCalledWith(
          'LocalizedString component must have a prop \'id\' or \'i18n\'!')
        done()
      }
    })
  })
})
