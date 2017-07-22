import {
  getSingularFunction,
  getSingularContextFunction,
  getPluralFunction,
  getPluralContextFunction,
  getSingularAttribute,
  getPluralAttribute,
  getContextAttribute,
  getCommentAttribute,
  getComponentName,
  getShortFormAttribute,
} from 'arguments'

const DEFAULT_FUNCTIONS = {
  getSingularFunction: '_',
  getPluralFunction: '_n',
  getSingularContextFunction: '_c',
  getPluralContextFunction: '_nc',
}

const DEFAULT_ATTRIBUTES = {
  getSingularAttribute: 'id',
  getPluralAttribute: 'idPlural',
  getContextAttribute: 'context',
  getCommentAttribute: 'comment',
  getShortFormAttribute: 'i18n',
}

const CUSTOM_FUNCTIONS = {
  getSingularFunction: 'msg',
  getPluralFunction: 'msgp',
  getSingularContextFunction: 'msgc',
  getPluralContextFunction: 'msgpc',
}

const CUSTOM_ATTRIBUTES = {
  singular: 'msgid',
  plural: 'msgid_plural',
  context: 'msgctxt',
  comment: 'msgcmt',
}

describe('arguments', () => {
  describe('complete/empty overrides', () => {
    [
      getSingularFunction,
      getPluralFunction,
      getPluralContextFunction,
      getSingularContextFunction,
    ].forEach((func) => {
      describe(`#${func.name}`, () => {
        it('returns default function name if not defined', () => {
          expect(func({}).name).toBe(DEFAULT_FUNCTIONS[func.name])
        })

        it('returns custom function name if defined', () => {
          expect(func({
            opts: {
              function: [
                {
                  type: 'SINGULAR',
                  name: 'msg',
                }, {
                  type: 'PLURAL',
                  name: 'msgp',
                }, {
                  type: 'SINGULAR_CONTEXT',
                  name: 'msgc',
                }, {
                  type: 'PLURAL_CONTEXT',
                  name: 'msgpc',
                },
              ],
            },
          }).name).toBe(CUSTOM_FUNCTIONS[func.name])
        })
      })
    });

    [
      getSingularAttribute,
      getPluralAttribute,
      getContextAttribute,
      getCommentAttribute,
      getShortFormAttribute,
    ].forEach((func) => {
      describe(`#${func.name}`, () => {
        it('returns default attribute if not defined', () => {
          expect(func({})).toBe(DEFAULT_ATTRIBUTES[func.name])
        })

        it('returns custom attribute name if defined', () => {
          expect(func({
            opts: {
              component: {
                singular: 'msgid',
                plural: 'msgid_plural',
                context: 'msgctxt',
                comment: 'msgcmt',
              },
            },
          }).name).toBe(CUSTOM_ATTRIBUTES[func.name])
        })
      })
    })

    describe('#getComponentName', () => {
      it('returns default component name if not defined', () => {
        expect(getComponentName({})).toBe('LocalizedString')
      })
    })
  })

  describe('partial override', () => {
    describe('#getSingularAttribute', () => {
      it('returns default attribute if not specified in partial', () => {
        expect(getSingularAttribute({ opts: { component: { name: 'Msg' } } }))
          .toBe(DEFAULT_ATTRIBUTES.getSingularAttribute)
      })
    })

    describe('#getComponentName', () => {
      it('returns custom component name if defined', () => {
        expect(getComponentName({
          opts: { component: { name: 'Msg' } },
        })).toBe('Msg')
      })
    })
  })
})
