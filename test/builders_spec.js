const chai = require('chai');
const sinon = require('sinon');
const {
  buildCallExpressionEntry,
  buildJSXElementEntry,
  buildReference,
  mergeEntries,
} = require('../src/builders');

const expect = chai.expect;

describe('builders', () => {
  const state = {
    file: {
      opts: {
        filename: '/Users/rtymchyk/projects/project/js/code.js',
      },
    },
    opts: {
      includeReference: false,
    },
  };
  const types = {
    isStringLiteral: sinon.stub().returns(true),
  };

  describe('#buildCallExpressionEntry', () => {
    it('builds singular entry from call expression', () => {
      const path = {
        node: {
          callee: { name: '_' },
          arguments: [{ value: 'Hello' }],
        },
      };

      expect(buildCallExpressionEntry(types, path, state)).to.deep.equal({
        msgid: 'Hello',
      });
    });

    it('builds plural entry from call expression', () => {
      const path = {
        node: {
          callee: { name: '_n' },
          arguments: [
            { value: 'One' },
            { value: 'Many' },
            { value: 10 },
          ],
        },
      };

      expect(buildCallExpressionEntry(types, path, state)).to.deep.equal({
        msgid: 'One',
        msgid_plural: 'Many',
      });
    });

    it('builds singular entry with context from call expression', () => {
      const path = {
        node: {
          callee: { name: '_c' },
          arguments: [
            { value: 'Flag' },
            { value: 'Physical Object' },
          ],
        },
      };

      expect(buildCallExpressionEntry(types, path, state)).to.deep.equal({
        msgid: 'Flag',
        msgctxt: 'Physical Object',
      });
    });

    it('builds plural entry with context from call expression', () => {
      const path = {
        node: {
          callee: { name: '_nc' },
          arguments: [
            { value: 'One' },
            { value: 'Many' },
            { value: 10 },
            { value: 'Some context' },
          ],
        },
      };

      expect(buildCallExpressionEntry(types, path, state)).to.deep.equal({
        msgid: 'One',
        msgid_plural: 'Many',
        msgctxt: 'Some context',
      });
    });
  });

  describe('#buildJSXElementEntry', () => {
    it('builds complete entry from a JSX element', () => {
      const path = {
        node: {
          openingElement: {
            name: { name: 'LocalizedString' },
            attributes: [{
              name: { name: 'id' },
              value: { value: 'You have one friend!' },
            }, {
              name: { name: 'idPlural' },
              value: { value: 'You have {numFriends} friends!' },
            }, {
              name: { name: 'context' },
              value: { value: 'Context' },
            }, {
              name: { name: 'comment' },
              value: { value: 'On homepage' },
            }, {
              name: { name: 'numFriends' },
              value: { value: '10,000' },
            }, {
              name: { name: 'count' },
              value: { value: 10000 },
            }],
          },
        },
      };

      expect(buildJSXElementEntry(types, path, state)).to.deep.equal({
        msgid: 'You have one friend!',
        msgid_plural: 'You have {numFriends} friends!',
        msgctxt: 'Context',
        extracted: 'On homepage',
      });
    });
  });

  describe('#mergeEntries', () => {
    it('includes default charset and headers if included', () => {
      const charset = 'UTF-8';
      const expectedHeaders = {
        'content-type': 'text/plain; charset=UTF-8',
        'plural-forms': 'nplurals=2; plural=(n!=1);',
        language: 'en_US',
      };
      const result = mergeEntries({}, []);

      expect(result.charset).to.equal(charset);
      expect(result.headers).to.deep.equal(expectedHeaders);
    });

    it('allows overriding/including headers and charset', () => {
      const charset = 'XYZ';
      const headers = {
        'content-type': 'text/plain; charset=XYZ',
      };
      const expectedHeaders = {
        'content-type': 'text/plain; charset=XYZ',
        'plural-forms': 'nplurals=2; plural=(n!=1);',
        language: 'en_US',
      };

      const result = mergeEntries({ charset, headers }, []);
      expect(result.charset).to.equal(charset);
      expect(result.headers).to.deep.equal(expectedHeaders);
    });

    it('appends new references if same entry key', () => {
      const result = mergeEntries({ includeReference: true }, [
        { msgid: 'Hello', reference: 'somefile.js' },
        { msgid: 'Hello', reference: 'somefile2.js' },
        { msgid: 'Hello', msgid_plural: 'World', reference: 'somefile3.js' },
      ]);

      expect(result.translations[''].Hello.comments.reference).to.equal(
        'somefile.js\nsomefile2.js\nsomefile3.js');
    });

    it('does not append new reference if same reference', () => {
      const result = mergeEntries({ includeReference: true }, [
        { msgid: 'Hello', reference: 'somefile.js' },
        { msgid: 'Hello', reference: 'somefile.js' },
      ]);

      expect(result.translations[''].Hello.comments.reference).to.equal(
        'somefile.js');
    });

    it('inserts new context key if does not exist', () => {
      const result = mergeEntries({}, [{
        msgctxt: 'Physical',
        msgid: 'Flag',
      }]);

      expect(result.translations.Physical).to.not.equal(undefined);
    });

    it('singular entry contains 1 msgstr', () => {
      const result = mergeEntries({}, [{ msgid: 'World' }]);

      expect(result.translations[''].World.msgstr).to.deep.equal(['']);
    });

    it('plural entry contains 2 msgstr', () => {
      const result = mergeEntries({}, [{
        msgid_plural: 'Many',
        msgid: 'One',
      }]);

      expect(result.translations[''].One.msgstr).to.deep.equal(['', '']);
    });

    it('uses first extracted comment for merging duplicates', () => {
      const result = mergeEntries({}, [{
        msgid: 'Hello',
        extracted: 'On homepage!',
      }, {
        msgid: 'Hello',
        extracted: 'On logout page!',
      }]);

      expect(result.translations[''].Hello.comments.extracted).to.equal(
        'On homepage!');
    });

    it('uses first plural form found for merging duplicates', () => {
      const result = mergeEntries({}, [{
        msgid: 'One',
        msgid_plural: 'Many',
      }, {
        msgid: 'One',
        msgid_plural: 'So Many',
      }]);

      expect(result.translations[''].One.msgid_plural).to.equal('Many');
    });

    it('can inflate singular to plural entry if duplicated', () => {
      const result = mergeEntries({}, [{
        msgid: 'One',
      }, {
        msgid: 'One',
        msgid_plural: 'Many',
      }]);

      const entry = result.translations[''].One;
      expect(entry.msgid).to.equal('One');
      expect(entry.msgid_plural).to.equal('Many');
      expect(entry.msgstr).to.deep.equal(['', '']);
    });

    it('keeps plural entry if singular duplicates it', () => {
      const result = mergeEntries({}, [{
        msgid: 'One',
        msgid_plural: 'Many',
      }, {
        msgid: 'One',
      }]);

      const entry = result.translations[''].One;
      expect(entry.msgid).to.equal('One');
      expect(entry.msgid_plural).to.equal('Many');
      expect(entry.msgstr).to.deep.equal(['', '']);
    });
  });

  describe('#buildReference', () => {
    it('does not include reference if disabled', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, { opts: { includeReference: false } }));

      expect(result.reference).to.equal(undefined);
    });

    it('includes reference if enabled', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, { opts: { includeReference: true } }));

      expect(result.reference)
        .to.equal('/Users/rtymchyk/projects/project/js/code.js');
    });

    it('strips up to base directory from reference if found', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, {
          opts: {
            includeReference: true,
            baseDir: 'project',
          },
        }));

      expect(result.reference).to.equal('js/code.js');
    });

    it('uses file name as entry reference if base directory not found', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, {
          includeReference: true,
          opts: {
            includeReference: true,
            baseDir: 'x',
          },
        }));

      expect(result.reference).to.equal(
        '/Users/rtymchyk/projects/project/js/code.js');
    });
  });
});
