const {
  validateFuncArg,
  validateComponentEntry,
} = require('../validators');
const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const fail = chai.assert.fail;

describe('Validators', () => {
  const path = {
    buildCodeFrameError: sinon.spy(),
  };

  describe('validateFuncArg', () => {
    it('returns arg value if arg is a String literal', () => {
      const value = validateFuncArg({ value: 'Hello' }, 0, '_', {
        isStringLiteral: sinon.stub().returns(true),
      }, path);

      expect(value).to.equal('Hello');
    });

    it('throws error if arg is not a String literal', () => {
      try {
        validateFuncArg({ value: 1 }, 0, '_', {
          isStringLiteral: sinon.stub().returns(false),
        }, path);
        fail();
      } catch (error) {
        expect(path.buildCodeFrameError.calledWith(
          'Function _ must have a String literal for argument #1!'))
          .to.equal(true);
      }
    });
  });

  describe('validateComponentEntry', () => {
    const types = sinon.stub();
    const state = sinon.stub();

    it('does not throw error if contains singular form', () => {
      validateComponentEntry({ msgid: 'Hello'}, types, path, state);
    });

    it('throws error if does not contain singular form', () => {
      try {
        validateComponentEntry({ msgid_plural: 'Many' }, types, path, state);
        fail();
      } catch (error) {
        expect(path.buildCodeFrameError.calledWith(
          'LocalizedString component must have a prop id for singular form!'))
          .to.equal(true);
      }
    });
  });
});
