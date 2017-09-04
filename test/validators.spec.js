import {
  validateComponentEntry,
} from 'validators'

describe('validators', () => {
  const path = {
    buildCodeFrameError: jest.fn(),
  }

  beforeEach(() => {
    path.buildCodeFrameError.mockReset()
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
