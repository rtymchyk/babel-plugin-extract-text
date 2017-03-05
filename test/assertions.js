const expect = require('chai').expect;

module.exports = {
  assertHasSingularEntry(po, singular) {
    const entry = po.translations[''][singular];
    expect(entry).to.not.equal(undefined);
    expect(entry).to.deep.equal({
      msgid: singular,
      msgstr: [''],
    });
  },

  assertHasSingularContextEntry(po, singular, context) {
    expect(po.translations[context]).to.not.equal(undefined);

    const entry = po.translations[context][singular];
    expect(entry).to.not.equal(undefined);
    expect(entry).to.deep.equal({
      msgid: singular,
      msgctxt: context,
      msgstr: [''],
    });
  },

  assertHasPluralEntry(po, singular, plural) {
    const entry = po.translations[''][singular];
    expect(entry).to.not.equal(undefined);
    expect(entry).to.deep.equal({
      msgid: singular,
      msgid_plural: plural,
      msgstr: ['', ''],
    });
  },

  assertHasPluralContextEntry(po, singular, plural, context) {
    expect(po.translations[context]).to.not.equal(undefined);

    const entry = po.translations[context][singular];
    expect(entry).to.not.equal(undefined);
    expect(entry).to.deep.equal({
      msgid: singular,
      msgid_plural: plural,
      msgctxt: context,
      msgstr: ['', ''],
    });
  },

  assertNumberOfEntries(po, expectedNumber) {
    const entries = Object.keys(po.translations).reduce((accumulator, currentValue) => (
      accumulator + Object.keys(po.translations[currentValue]).length), 0) - 1;

    expect(entries).to.equal(expectedNumber);
  },
};
