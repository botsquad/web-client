var assert = require('chai').assert

var util = require('../src/components/elements/util')

describe('processText', function () {
  it('works', function(done) {
    var s = util.processText("https://nl.wikipedia.org/wiki/Ezel_(dier)").__html
    assert.equal('<p><a target="_blank" rel="nofollow" href="https://nl.wikipedia.org/wiki/Ezel_(dier)">https://nl.wikipedia.org/wiki/Ezel_(dier)</a></p>\n', s)
    assert.equal('<p>hoi<br>hoi</p>\n', util.processText("hoi\nhoi").__html)

    assert.equal('<p><strong>Click this</strong>: <a target="_blank" rel="nofollow" href="https://nu.nl">link</a>.</p>\n', util.processText('**Click this**: [link](https://nu.nl).').__html)

    done()
  })
})
