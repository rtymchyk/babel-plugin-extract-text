const expect = require('chai').expect;

const {
  getSingularFunction,
  getSingularContextFunction,
  getPluralFunction,
  getPluralContextFunction,
  getSingularAttribute,
  getPluralAttribute,
  getContextAttribute,
  getCommentAttribute,
  getComponentName,
} = require('../arguments');

const DEFAULT_FUNCTIONS = {
  getSingularFunction: '_',
  getPluralFunction: '_n',
  getSingularContextFunction: '_c',
  getPluralContextFunction: '_nc',
};

const DEFAULT_ATTRIBUTES = {
  getSingularAttribute: 'id',
  getPluralAttribute: 'idPlural',
  getContextAttribute: 'context',
  getCommentAttribute: 'comment',
};

const CUSTOM_FUNCTIONS = {
  getSingularFunction: 'msg',
  getPluralFunction: 'msgp',
  getSingularContextFunction: 'msgc',
  getPluralContextFunction: 'msgpc',
};

const CUSTOM_ATTRIBUTES = {
  singular: 'msgid',
  plural: 'msgid_plural',
  context: 'msgctxt',
  comment: 'msgcmt',
};

describe('arguments', () => {
  context('complete/empty overrides', () => {
    [
      getSingularFunction,
      getPluralFunction,
      getPluralContextFunction,
      getSingularContextFunction,
    ].forEach(func => {
      describe(`#${func.name}`, () => {
        it('returns default function name if not defined', () => {
          expect(func({}).name).to.equal(DEFAULT_FUNCTIONS[func.name]);
        });

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
          }).name).to.equal(CUSTOM_FUNCTIONS[func.name]);
        });
      });
    });

    [
      getSingularAttribute,
      getPluralAttribute,
      getContextAttribute,
      getCommentAttribute,
    ].forEach(func => {
      describe(`#${func.name}`, () => {
        it('returns default attribute if not defined', () => {
          expect(func({})).to.equal(DEFAULT_ATTRIBUTES[func.name]);
        });

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
          }).name).to.equal(CUSTOM_ATTRIBUTES[func.name]);
        });
      });
    });

    describe('#getComponentName', () => {
      it('returns default component name if not defined', () => {
        expect(getComponentName({})).to.equal('LocalizedString');
      });
    });
  });

  context('partial override', () => {
    describe('#getSingularAttribute', () => {
      it('returns default attribute if not specified in partial', () => {
        expect(getSingularAttribute({ opts: { component: { name: 'Msg' }}}))
          .to.equal(DEFAULT_ATTRIBUTES['getSingularAttribute']);
      });
    });

    describe('#getComponentName', () => {
      it('returns custom component name if defined', () => {
        expect(getComponentName({
          opts: { component: { name: 'Msg' }},
        })).to.equal('Msg');
      });
    });
  });
});
