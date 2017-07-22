import {
  buildCallExpressionEntry,
  buildJSXElementEntry,
  buildReference,
  mergeEntries,
} from 'builders'

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
  }
  const types = {
    isStringLiteral: jest.fn(() => true),
  }

  describe('#buildCallExpressionEntry', () => {
    it('builds singular entry from call expression', () => {
      const path = {
        node: {
          callee: { name: '_' },
          arguments: [{ value: 'Hello' }],
        },
      }

      expect(buildCallExpressionEntry(types, path, state)).toEqual({
        msgid: 'Hello',
      })
    })

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
      }

      expect(buildCallExpressionEntry(types, path, state)).toEqual({
        msgid: 'One',
        msgid_plural: 'Many',
      })
    })

    it('builds singular entry with context from call expression', () => {
      const path = {
        node: {
          callee: { name: '_c' },
          arguments: [
            { value: 'Flag' },
            { value: 'Physical Object' },
          ],
        },
      }

      expect(buildCallExpressionEntry(types, path, state)).toEqual({
        msgid: 'Flag',
        msgctxt: 'Physical Object',
      })
    })

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
      }

      expect(buildCallExpressionEntry(types, path, state)).toEqual({
        msgid: 'One',
        msgid_plural: 'Many',
        msgctxt: 'Some context',
      })
    })
  })

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
      }

      expect(buildJSXElementEntry(types, path, state)).toEqual({
        msgid: 'You have one friend!',
        msgid_plural: 'You have {numFriends} friends!',
        msgctxt: 'Context',
        extracted: 'On homepage',
      })
    })

    it('does not build anything if includes the shortform prop', () => {
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
              name: { name: 'i18n' },
              value: { value: jest.fn() },
            }],
          },
        },
      }

      expect(buildJSXElementEntry(types, path, state)).toBeNull()
    })
  })

  describe('#mergeEntries', () => {
    it('includes default charset and headers if included', () => {
      const charset = 'UTF-8'
      const expectedHeaders = {
        'content-type': 'text/plain; charset=UTF-8',
        'plural-forms': 'nplurals=2; plural=(n!=1);',
        language: 'en_US',
      }
      const result = mergeEntries({}, [])

      expect(result.charset).toEqual(charset)
      expect(result.headers).toEqual(expectedHeaders)
    })

    it('allows overriding/including headers and charset', () => {
      const charset = 'XYZ'
      const headers = {
        'content-type': 'text/plain; charset=XYZ',
      }
      const expectedHeaders = {
        'content-type': 'text/plain; charset=XYZ',
        'plural-forms': 'nplurals=2; plural=(n!=1);',
        language: 'en_US',
      }

      const result = mergeEntries({ charset, headers }, [])
      expect(result.charset).toEqual(charset)
      expect(result.headers).toEqual(expectedHeaders)
    })

    it('appends new references if same entry key', () => {
      const result = mergeEntries({ includeReference: true }, [
        { msgid: 'Hello', reference: 'somefile.js' },
        { msgid: 'Hello', reference: 'somefile2.js' },
        { msgid: 'Hello', msgid_plural: 'World', reference: 'somefile3.js' },
      ])

      expect(result.translations[''].Hello.comments.reference).toBe(
        'somefile.js\nsomefile2.js\nsomefile3.js')
    })

    it('does not append new reference if same reference', () => {
      const result = mergeEntries({ includeReference: true }, [
        { msgid: 'Hello', reference: 'somefile.js' },
        { msgid: 'Hello', reference: 'somefile.js' },
      ])

      expect(result.translations[''].Hello.comments.reference).toBe('somefile.js')
    })

    it('inserts new context key if does not exist', () => {
      const result = mergeEntries({}, [{
        msgctxt: 'Physical',
        msgid: 'Flag',
      }])

      expect(result.translations.Physical).not.toBeUndefined()
    })

    it('singular entry contains 1 msgstr', () => {
      const result = mergeEntries({}, [{ msgid: 'World' }])

      expect(result.translations[''].World.msgstr).toEqual([''])
    })

    it('plural entry contains 2 msgstr', () => {
      const result = mergeEntries({}, [{
        msgid_plural: 'Many',
        msgid: 'One',
      }])

      expect(result.translations[''].One.msgstr).toEqual(['', ''])
    })

    it('uses first extracted comment for merging duplicates', () => {
      const result = mergeEntries({}, [{
        msgid: 'Hello',
        extracted: 'On homepage!',
      }, {
        msgid: 'Hello',
        extracted: 'On logout page!',
      }])

      expect(result.translations[''].Hello.comments.extracted).toBe('On homepage!')
    })

    it('uses first plural form found for merging duplicates', () => {
      const result = mergeEntries({}, [{
        msgid: 'One',
        msgid_plural: 'Many',
      }, {
        msgid: 'One',
        msgid_plural: 'So Many',
      }])

      expect(result.translations[''].One.msgid_plural).toBe('Many')
    })

    it('can inflate singular to plural entry if duplicated', () => {
      const result = mergeEntries({}, [{
        msgid: 'One',
      }, {
        msgid: 'One',
        msgid_plural: 'Many',
      }])

      const entry = result.translations[''].One
      expect(entry.msgid).toBe('One')
      expect(entry.msgid_plural).toBe('Many')
      expect(entry.msgstr).toEqual(['', ''])
    })

    it('keeps plural entry if singular duplicates it', () => {
      const result = mergeEntries({}, [{
        msgid: 'One',
        msgid_plural: 'Many',
      }, {
        msgid: 'One',
      }])

      const entry = result.translations[''].One
      expect(entry.msgid).toBe('One')
      expect(entry.msgid_plural).toBe('Many')
      expect(entry.msgstr).toEqual(['', ''])
    })
  })

  describe('#buildReference', () => {
    it('does not include reference if disabled', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, { opts: { includeReference: false } }))

      expect(result.reference).toBeUndefined()
    })

    it('includes reference if enabled', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, { opts: { includeReference: true } }))

      expect(result.reference).toBe('/Users/rtymchyk/projects/project/js/code.js')
    })

    it('strips up to base directory from reference if found', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, {
          opts: {
            includeReference: true,
            baseDir: 'project',
          },
        }))

      expect(result.reference).toBe('js/code.js')
    })

    it('uses file name as entry reference if base directory not found', () => {
      const result = buildReference(
        { msgid: 'Hello' },
        Object.assign({}, state, {
          includeReference: true,
          opts: {
            includeReference: true,
            baseDir: 'x',
          },
        }))

      expect(result.reference).toBe('/Users/rtymchyk/projects/project/js/code.js')
    })
  })
})
