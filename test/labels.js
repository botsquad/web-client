import { assert } from 'chai'
import * as labels from '../src/common/labels.tsx'

// Mock navigator.language using Object.defineProperty
Object.defineProperty(global, 'navigator', {
  value: {
    language: 'en',
  },
  writable: true,
  configurable: true,
})

describe('resolveTranslations', function () {
  it('translates, given a language list', function (done) {
    const tr = labels.resolveTranslations

    assert.deepEqual([1, 2, 3], tr([1, 2, 3], null, null))
    assert.deepEqual('foo', tr('foo', null, null))
    assert.deepEqual(true, tr(true, null, null))
    assert.deepEqual({ a: 1, b: 2, xx: [1, 2, 3] }, tr({ a: 1, b: 2, xx: [1, 2, 3] }, null, null))

    const value = { $i18n: true, nl: 'Nederlands', de: 'Deutsch', en: 'English' }
    assert.deepEqual('Nederlands', tr(value, ['nl'], null))
    assert.deepEqual('Deutsch', tr(value, ['de'], null))
    assert.deepEqual('English', tr(value, ['en'], null))

    done()
  })

  it('translates, given pref language + bot', function (done) {
    const tr = labels.resolveTranslations

    const value = { $i18n: true, nl: 'Nederlands', de: 'Deutsch', en: 'English' }
    assert.deepEqual('Nederlands', tr(value, 'nl', { locale: 'en', extra_locales: ['nl'] }))
    assert.deepEqual('English', tr(value, 'nl', { locale: 'en', extra_locales: [] }))
    assert.deepEqual('English', tr(value, 'nl', { locale: 'en', extra_locales: ['de'] }))
    assert.deepEqual('Deutsch', tr(value, 'de', { locale: 'en', extra_locales: ['de'] }))

    done()
  })
})
