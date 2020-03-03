import marked from 'marked'

export function messageHasModal({ type, payload }) {
  if (type === 'location') {
    return true
  }
  if (type === 'media') {
    return payload.kind === 'web' || payload.kind === 'image'
  }
  if (type === 'template' && payload.template_type === 'generic') {
    return true
  }
  return false
}

const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(string) {
  return String(string).replace(/[&<>"']/g, (s) => HTML_ENTITIES[s])
}

let markdownOpts = null

export function processText(string) {
  if (!markdownOpts) {
    const renderer = new marked.Renderer()
    const linkRenderer = renderer.link
    renderer.link = (href, title, text) => {
      const html = linkRenderer.call(renderer, href, title, text)
      return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ')
    }
    markdownOpts = { renderer, breaks: true, gfm: true }
  }
  return { __html: marked(escapeHtml(string), markdownOpts) }
}

const SCAN_BLIP = 'https://s3.eu-central-1.amazonaws.com/bsqd/audio/4ae396ab-fac5-4757-bb2e-7734d0e32ae1.dat'
export function scannerSound() {
  return new Audio(SCAN_BLIP)
}
