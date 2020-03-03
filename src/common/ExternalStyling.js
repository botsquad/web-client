import React, { useEffect } from 'react'

export default function({ extra_css, extra_js }) {

  if (extra_css) {
    useEffect(() => {
      const tag = document.createElement("style")
      tag.innerText = extra_css
      document.head.appendChild(tag)

      return () => document.head.removeChild(tag)
    }, [])
  }

  if (extra_js) {
    useEffect(() => {
      const tag = document.createElement("script")
      tag.type = 'text/javascript'
      tag.innerText = extra_js
      document.head.appendChild(tag)

      return () => document.head.removeChild(tag)
    }, [])
  }

  return extra_css ? <style>{extra_css}</style> : null
}
