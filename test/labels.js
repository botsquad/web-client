var assert = require('chai').assert

var labels = require('../src/common/labels')

describe('resolveTranslations', function () {
  it('translates, given a language list', function(done) {
    const tr = labels.resolveTranslations

    assert.deepEqual([1, 2, 3], tr([1, 2, 3]))
    assert.deepEqual("foo", tr("foo"))
    assert.deepEqual(true, tr(true))
    assert.deepEqual({a: 1, b: 2, xx: [1, 2, 3]}, tr({a: 1, b: 2, xx: [1, 2, 3]}))

    const value = { $i18n: true, nl: "Nederlands", de: "Deutsch", en: "English" }
    assert.deepEqual("Nederlands", tr(value, ['nl']))
    assert.deepEqual("Deutsch", tr(value, ['de']))
    assert.deepEqual("English", tr(value))

    done()
  })

  it('translates, given pref language + bot', function(done) {
    const tr = labels.resolveTranslations

    const value = { $i18n: true, nl: "Nederlands", de: "Deutsch", en: "English" };
    assert.deepEqual("Nederlands", tr(value, 'nl', { locale: 'en', extra_locales: ['nl'] }))
    assert.deepEqual("English", tr(value, 'nl', { locale: 'en', extra_locales: [] }))
    assert.deepEqual("English", tr(value, 'nl', { locale: 'en', extra_locales: ['de'] }))
    assert.deepEqual("Deutsch", tr(value, 'de', { locale: 'en', extra_locales: ['de'] }))

    done()
  })
})
