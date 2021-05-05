import { JSDOM } from 'jsdom'
import { assert } from 'chai'

global.dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.com/page.html' })
global.window = dom.window
global.document = dom.window.document
global.navigator = global.window.navigator

import * as util from '../src/components/elements/util'

describe('processText', function() {
  it('works', function(done) {
    var s = util.processText('https://nl.wikipedia.org/wiki/Ezel_(dier)').__html
    assert.equal(
      '<p><a target="_blank" rel="nofollow" href="https://nl.wikipedia.org/wiki/Ezel_(dier)">https://nl.wikipedia.org/wiki/Ezel_(dier)</a></p>\n',
      s,
    )
    assert.equal('<p>hoi<br>hoi</p>\n', util.processText('hoi\nhoi').__html)

    assert.equal(
      '<p><strong>Click this</strong>: <a target="_blank" rel="nofollow" href="https://nu.nl">link</a>.</p>\n',
      util.processText('**Click this**: [link](https://nu.nl).').__html,
    )

    done()
  })

  it('does not open new window when on same domain', function() {
    let s

    s = util.processText('[klik hier](https://example.com/x.html)').__html
    assert.equal('<p><a target="_top" href="https://example.com/x.html">klik hier</a></p>\n', s)

    s = util.processText('[klik hier](/x.html)').__html
    assert.equal('<p><a target="_top" href="/x.html">klik hier</a></p>\n', s)
  })
})
