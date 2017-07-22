module.exports = {
  assertHasSingularEntry (po, singular) {
    const entry = po.translations[''][singular]
    expect(entry).toEqual({
      msgid: singular,
      msgstr: [''],
    })
  },

  assertHasSingularContextEntry (po, singular, context) {
    expect(po.translations[context]).not.toBeUndefined()

    const entry = po.translations[context][singular]
    expect(entry).toEqual({
      msgid: singular,
      msgctxt: context,
      msgstr: [''],
    })
  },

  assertHasPluralEntry (po, singular, plural) {
    const entry = po.translations[''][singular]
    expect(entry).toEqual({
      msgid: singular,
      msgid_plural: plural,
      msgstr: ['', ''],
    })
  },

  assertHasPluralContextEntry (po, singular, plural, context) {
    expect(po.translations[context]).not.toBeUndefined()

    const entry = po.translations[context][singular]
    expect(entry).toEqual({
      msgid: singular,
      msgid_plural: plural,
      msgctxt: context,
      msgstr: ['', ''],
    })
  },

  assertNumberOfEntries (po, expectedNumber) {
    const entries = Object.keys(po.translations).reduce((accumulator, currentValue) => (
      accumulator + Object.keys(po.translations[currentValue]).length), 0) - 1

    expect(entries).toBe(expectedNumber)
  },
}
