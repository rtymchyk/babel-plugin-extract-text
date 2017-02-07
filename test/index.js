const expect = require('chai').expect;
const babel = require('babel-core');
const fs = require('fs');
const gettextParser = require('gettext-parser');
const decache = require('decache');

const {
  assertHasSingularEntry,
  assertHasSingularContextEntry,
  assertHasPluralEntry,
  assertHasPluralContextEntry,
  assertNumberOfEntries,
} = require('./assertions');

const TESTPO = 'test.po';
const OPTIONS = {
  presets: ['react'],
  plugins: [['./index.js', {
    outputFile: TESTPO,
  }]],
};

afterEach(() => {
  decache('../index.js');
  if (fs.existsSync(TESTPO)) {
    fs.unlinkSync(TESTPO);
  }
});

describe('Visitors', () => {
  describe('JSXElement', () => {
    it('should extract 1 singular string', () => {
      babel.transform('<LocalizedString id="Hello World!"/>', OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasSingularEntry(po, 'Hello World!');
      assertNumberOfEntries(po, 1);
    });

    it('should extract 1 singular/plural string ', () => {
      babel.transform('<LocalizedString id="One" idPlural="Many"/>', OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasPluralEntry(po, 'One', 'Many');
      assertNumberOfEntries(po, 1);
    });

    it('should extract 1 singular string with context', () => {
      babel.transform('<LocalizedString id="Flag" context="Object"/>', OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasSingularContextEntry(po, 'Flag', 'Object');
      assertNumberOfEntries(po, 1);
    });

    it('should extract 1 singular/plural string with context', () => {
      babel.transform(
        '<LocalizedString id="1 flag" idPlural="Many flags" context="Object"/>',
        OPTIONS
      );
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasPluralContextEntry(po, '1 flag', 'Many flags', 'Object');
      assertNumberOfEntries(po, 1);
    });

    it('should extract comments', () => {
      babel.transform(
        '<LocalizedString id="Hey there!" comment="On Homepage"/>', OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      expect(po.translations['']['Hey there!'].comments.extracted).to.equal(
        'On Homepage');
      assertNumberOfEntries(po, 1);
    });
  });

  describe('CallExpression', () => {
    it('should extract 1 singular string', () => {
      babel.transform("_('Hello World!')", OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasSingularEntry(po, 'Hello World!');
      assertNumberOfEntries(po, 1);
    });

    it('should extract 1 singular/plural string ', () => {
      babel.transform("_n('One', 'Many', 5)", OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasPluralEntry(po, 'One', 'Many');
      assertNumberOfEntries(po, 1);
    });

    it('should extract 1 singular string with context', () => {
      babel.transform("_c('Flag', 'Object')", OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasSingularContextEntry(po, 'Flag', 'Object');
      assertNumberOfEntries(po, 1);
    });

    it('should extract 1 singular/plural string with context', () => {
      babel.transform("_nc('1 flag', 'Many flags', 5, 'Object')", OPTIONS);
      const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
      assertHasPluralContextEntry(po, '1 flag', 'Many flags', 'Object');
      assertNumberOfEntries(po, 1);
    });
  });
});

describe('Plugin Configuration', () => {
  it('JSXElement', () => {
    babel.transform(
      '<Msg msgid="1 Cat" msgid_plural="Many Cats" msgctxt="SomeContext"/>',
      {
        presets: ['react'],
        plugins: [['./index.js', {
          outputFile: TESTPO,
          component: {
            name: 'Msg',
            singular: 'msgid',
            plural: 'msgid_plural',
            context: 'msgctxt',
          },
        }]],
      }
    );
    const po = gettextParser.po.parse(fs.readFileSync(TESTPO));
    assertHasPluralContextEntry(po, '1 Cat', 'Many Cats', 'SomeContext');
    assertNumberOfEntries(po, 1);
  });

  it('CallExpression', () => {
    babel.transform(
      `
        msg(locale, 'Hello');
        msgp(locale, '1 person', '{x} people', 5);
        msgc(locale, 'Block', 'Lego');
        msgpc(locale, 'One', 'Many', 5, 'People');
      `,
      {
        presets: ['react'],
        plugins: [['./index.js', {
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
        }]],
      }
    );
    const po = gettextParser.po.parse(fs.readFileSync(TESTPO));

    assertHasSingularEntry(po, 'Hello');
    assertHasSingularContextEntry(po, 'Block', 'Lego');
    assertHasPluralEntry(po, '1 person', '{x} people');
    assertHasPluralContextEntry(po, 'One', 'Many', 'People');
    assertNumberOfEntries(po, 4);
  });
});
