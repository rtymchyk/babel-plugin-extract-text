import { transform } from 'babel-core'
import fs from 'fs'
import { po as poParser } from 'gettext-parser'

import {
  assertHasSingularEntry,
  assertHasSingularContextEntry,
  assertHasPluralEntry,
  assertHasPluralContextEntry,
  assertNumberOfEntries,
} from './assertions'

const TESTPO = 'test.po'
const OPTIONS = {
  plugins: [
    'syntax-jsx',
    ['./plugin.js', { outputFile: TESTPO }],
  ],
}

describe('plugin', () => {
  afterEach(() => {
    if (fs.existsSync(TESTPO)) {
      fs.unlinkSync(TESTPO)
    }
  })

  describe('Visitors', () => {
    describe('JSXElement', () => {
      it('should extract 1 singular string', () => {
        transform('<LocalizedString id="Hello World!"/>', OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasSingularEntry(po, 'Hello World!')
        assertNumberOfEntries(po, 1)
      })

      it('should extract 1 singular/plural string ', () => {
        transform('<LocalizedString id="One" idPlural="Many"/>', OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasPluralEntry(po, 'One', 'Many')
        assertNumberOfEntries(po, 1)
      })

      it('should extract 1 singular string with context', () => {
        transform('<LocalizedString id="Flag" context="Object"/>', OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasSingularContextEntry(po, 'Flag', 'Object')
        assertNumberOfEntries(po, 1)
      })

      it('should extract 1 singular/plural string with context', () => {
        transform(
          '<LocalizedString id="1 flag" idPlural="Many flags" context="Object"/>',
          OPTIONS
        )
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasPluralContextEntry(po, '1 flag', 'Many flags', 'Object')
        assertNumberOfEntries(po, 1)
      })

      it('should extract comments', () => {
        transform(
          '<LocalizedString id="Hey there!" comment="On Homepage"/>', OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        expect(po.translations['']['Hey there!'].comments.extracted).toBe('On Homepage')
        assertNumberOfEntries(po, 1)
      })
    })

    describe('CallExpression', () => {
      it('should extract 1 singular string', () => {
        transform("_('Hello World!')", OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasSingularEntry(po, 'Hello World!')
        assertNumberOfEntries(po, 1)
      })

      it('should extract 1 singular/plural string ', () => {
        transform("_n('One', 'Many', 5)", OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasPluralEntry(po, 'One', 'Many')
        assertNumberOfEntries(po, 1)
      })

      it('should extract 1 singular string with context', () => {
        transform("_c('Flag', 'Object')", OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasSingularContextEntry(po, 'Flag', 'Object')
        assertNumberOfEntries(po, 1)
      })

      it('should extract 1 singular/plural string with context', () => {
        transform("_nc('1 flag', 'Many flags', 5, 'Object')", OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasPluralContextEntry(po, '1 flag', 'Many flags', 'Object')
        assertNumberOfEntries(po, 1)
      })

      it('should extract from shortform call expression', () => {
        transform("<Msg i18n={_('Hey {name}!')} name='Bob' />", OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasSingularEntry(po, 'Hey {name}!')
        assertNumberOfEntries(po, 1)
      })

      it('should extract concatenated strings', () => {
        transform(`
          _nc('1' + (' flag'), ('Many' + ' flags') + (', many' + ' flags'), 5, 'Physical' + ' Object')
        `, OPTIONS)
        const po = poParser.parse(fs.readFileSync(TESTPO))
        assertHasPluralContextEntry(po, '1 flag', 'Many flags, many flags', 'Physical Object')
        assertNumberOfEntries(po, 1)
      })
    })
  })

  describe('CallExpression in two or more different variants', () => {
    const options = {
      plugins: [
        'syntax-jsx',
        ['./plugin.js', {
          outputFile: TESTPO,
          function: [
            {
              type: 'SINGULAR',
              name: '_',
              singular: 0,
            }, {
              type: 'SINGULAR',
              name: 'gettext',
              singular: 0,
            }, {
              type: 'PLURAL',
              name: '_n',
              singular: 0,
              plural: 1,
            }, {
              type: 'PLURAL',
              name: 'ngettext',
              singular: 0,
              plural: 1,
            }, {
              type: 'SINGULAR_CONTEXT',
              name: '_c',
              singular: 0,
              context: 1,
            }, {
              type: 'SINGULAR_CONTEXT',
              name: 'pgettext',
              singular: 1,
              context: 0,
            }, {
              type: 'PLURAL_CONTEXT',
              name: '_nc',
              singular: 0,
              plural: 1,
              context: 3,
            }, {
              type: 'PLURAL_CONTEXT',
              name: 'npgettext',
              singular: 1,
              plural: 2,
              context: 0,
            }],
        }],
      ],
    }

    it('should extract from two similar singular function', () => {
      transform("_('Hello World!'); gettext('Hello gettext!')", options)
      const po = poParser.parse(fs.readFileSync(TESTPO))
      assertHasSingularEntry(po, 'Hello World!')
      assertHasSingularEntry(po, 'Hello gettext!')
      assertNumberOfEntries(po, 2)
    })

    it('should extract from two similar singular/plural function', () => {
      transform("_n('One', 'Many', 5); ngettext('apple', 'apples', 3)", options)
      const po = poParser.parse(fs.readFileSync(TESTPO))
      assertHasPluralEntry(po, 'One', 'Many')
      assertHasPluralEntry(po, 'apple', 'apples')
      assertNumberOfEntries(po, 2)
    })

    it('should extract from two similar singular/context function', () => {
      transform("_c('Flag', 'Object'); pgettext('control', 'Save')", options)
      const po = poParser.parse(fs.readFileSync(TESTPO))
      assertHasSingularContextEntry(po, 'Flag', 'Object')
      assertHasSingularContextEntry(po, 'Save', 'control')
      assertNumberOfEntries(po, 2)
    })

    it('should extract from two similar singular/plural/context function', () => {
      transform(`_nc('1 flag', 'Many flags', 5, 'Object');
        npgettext('basket', 'apple', 'apples', 3);
      `, options)
      const po = poParser.parse(fs.readFileSync(TESTPO))
      assertHasPluralContextEntry(po, '1 flag', 'Many flags', 'Object')
      assertHasPluralContextEntry(po, 'apple', 'apples', 'basket')
      assertNumberOfEntries(po, 2)
    })
  })

  describe('Configuration', () => {
    it('JSXElement', () => {
      transform(
        '<Msg msgid="1 Cat" msgid_plural="Many Cats" msgctxt="SomeContext"/>',
        {
          plugins: [
            'syntax-jsx',
            ['./plugin.js', {
              outputFile: TESTPO,
              component: {
                name: 'Msg',
                singular: 'msgid',
                plural: 'msgid_plural',
                context: 'msgctxt',
              },
            }],
          ],
        }
      )
      const po = poParser.parse(fs.readFileSync(TESTPO))
      assertHasPluralContextEntry(po, '1 Cat', 'Many Cats', 'SomeContext')
      assertNumberOfEntries(po, 1)
    })

    it('CallExpression', () => {
      transform(
        `
          msg(locale, 'Hello');
          msgp(locale, '1 person', '{x} people', 5);
          msgc(locale, 'Block', 'Lego');
          msgpc(locale, 'One', 'Many', 5, 'People');
        `,
        {
          plugins: ['syntax-jsx',
            ['./plugin.js', {
              outputFile: TESTPO,
              function: [
                {
                  type: 'SINGULAR',
                  name: 'msg',
                  singular: 1,
                }, {
                  type: 'PLURAL',
                  name: 'msgp',
                  singular: 1,
                  plural: 2,
                }, {
                  type: 'SINGULAR_CONTEXT',
                  name: 'msgc',
                  singular: 1,
                  context: 2,
                }, {
                  type: 'PLURAL_CONTEXT',
                  name: 'msgpc',
                  singular: 1,
                  plural: 2,
                  context: 4,
                },
              ],
            }],
          ],
        }
      )
      const po = poParser.parse(fs.readFileSync(TESTPO))

      assertHasSingularEntry(po, 'Hello')
      assertHasSingularContextEntry(po, 'Block', 'Lego')
      assertHasPluralEntry(po, '1 person', '{x} people')
      assertHasPluralContextEntry(po, 'One', 'Many', 'People')
      assertNumberOfEntries(po, 4)
    })
  })
})
