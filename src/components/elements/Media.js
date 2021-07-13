import React from 'react'
import { EventEmitter } from 'fbemitter'
import { processText } from './util'
import { FileDownload } from '../icons'

export const mediaEvents = new EventEmitter()

class ModalWrapper extends React.PureComponent {
  onClick = () => {
    const { handler, modal, message } = this.props
    if (modal) {
      handler.component.hideModal()
    } else {
      handler.component.showModal(message)
    }
  }

  triggerResize(event, component, ratio) {
    if (!this.props.modal || (!component && !this._component)) {
      return
    }
    if (component && !this._component) {
      this._component = component
    }

    component = component || this._component

    const { clientWidth, clientHeight, clientRatio } = this.props.handler.getClientDimensions()

    this.props.modal.div.classList.toggle('prefer-height', ratio > clientRatio)

    let w
    let h
    if (this.props.message.payload.class && this.props.message.payload.class.match(/\bfullscreen\b/)) {
      w = clientWidth
      h = clientHeight
    } else if (clientRatio > ratio) {
      w = Math.floor(clientWidth * 0.9) - 8
      h = Math.floor(w * ratio)
    } else {
      h = Math.floor(clientHeight * 0.9) - 8
      w = Math.floor(h / ratio)
    }
    component.style.width = `${w}px`
    component.style.height = `${h}px`
  }

  render() {
    const { className } = this.props
    if (this.props.modal) {
      return this.props.children
    }

    return (
      <div className={className}>
        {React.Children.map(this.props.children, child => React.cloneElement(child, { onClick: this.onClick }))}
      </div>
    )
  }
}

export class ImageMedia extends React.PureComponent {
  state = {
    loading: true,
    retry: 0,
  }

  render() {
    const { message, onLoad } = this.props
    const { payload } = message
    let wrapper = null
    let component = null

    if (this.state.loading) {
      const img = document.createElement('img')
      img.onload = () => {
        this.setState({ loading: false })
      }
      img.onerror = () => {
        if (this.state.retry > 20) return
        setTimeout(() => this.setState({ retry: this.state.retry + 1 }), 250 + 50 * this.state.retry * this.state.retry)
      }
      img.src = payload.url

      return (
        <ModalWrapper
          {...this.props}
          ref={w => {
            wrapper = w
          }}
        >
          <span className="loading" />
        </ModalWrapper>
      )
    }
    return (
      <ModalWrapper
        {...this.props}
        className={`image ${this.props.className}`}
        ref={w => {
          wrapper = w
        }}
      >
        <div>
          <img
            role="presentation"
            ref={c => {
              component = c
            }}
            src={payload.url}
            onLoad={event => {
              if (onLoad) onLoad()
              if (wrapper && component) {
                wrapper.triggerResize(event, component, event.target.height / event.target.width)
              }
            }}
          />
          {payload.caption ? <div className="caption" dangerouslySetInnerHTML={processText(payload.caption)} /> : null}
        </div>
      </ModalWrapper>
    )
  }
}

function determineAspect(cls) {
  const ASPECTS = {
    'default': 0.5625,
    'two-by-three': 1.5,
    'three-by-four': 1.333,
    'square': 1,
    'four-by-three': 0.75,
    'three-by-two': 0.666,
    'two-by-one': 0.5,
  }
  return (cls || '').split(' ').reduce((acc, c) => acc || ASPECTS[c], false) || ASPECTS.default
}

export class WebMedia extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.message.payload.url !== nextProps.message.payload.url
  }

  render() {
    const { message, onLoad } = this.props
    const { payload } = message
    const { preview_image } = payload
    let component = null
    let wrapper = null
    const aspect = determineAspect(payload.class)
    const tryResize = t => {
      const resize = () => wrapper && component && wrapper.triggerResize(null, component, aspect)
      setTimeout(resize, 0)
      if (t) setTimeout(resize, t)
    }

    return (
      <ModalWrapper
        {...this.props}
        className={`web ${this.props.className}`}
        ref={w => {
          wrapper = w
          tryResize(100)
        }}
      >
        {preview_image && !this.props.modal ? (
          <img
            ref={c => {
              component = c
            }}
            src={preview_image}
            role="presentation"
          />
        ) : (
          <div>
            <div
              className="frame-wrapper "
              ref={c => {
                component = c
              }}
            >
              <iframe
                src={payload.url}
                scrolling="no"
                onLoad={() => {
                  if (onLoad) onLoad()
                  tryResize()
                }}
              />
            </div>
            {payload.caption ? (
              <div className="caption" dangerouslySetInnerHTML={processText(payload.caption)} />
            ) : null}
          </div>
        )}
      </ModalWrapper>
    )
  }
}

export class AudioMedia extends React.Component {
  audio = React.createRef()

  shouldComponentUpdate(nextProps) {
    return this.props.message.payload.url !== nextProps.message.payload.url
  }

  render() {
    const { message, className } = this.props
    const { payload } = message

    return (
      <div className={`${className} audio`}>
        <audio src={payload.url} controls ref={this.audio} />
        {payload.caption ? <div className="caption" dangerouslySetInnerHTML={processText(payload.caption)} /> : null}
      </div>
    )
  }

  _hasAudio = false

  componentDidMount() {
    const audio = this.audio.current

    this.props.handler.attachAudio(audio)
    audio.addEventListener('play', () => {
      mediaEvents.emit('audio.create', audio)
      this._hasAudio = true
    })
    audio.addEventListener('ended', () => {
      this.props.handler.send('event', { name: '$audio_ended', payload: { url: this.props.message.url } })
    })
  }

  componentWillUnmount() {
    if (this._hasAudio) {
      mediaEvents.emit('audio.destroy')
      this._hasAudio = false
    }
  }
}

export class VideoMedia extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.message.payload.url !== nextProps.message.payload.url
  }

  render() {
    const { message, className } = this.props
    const { payload } = message

    return (
      <div className={`${className} video`}>
        <video src={payload.url} controls />
        {payload.caption ? <div className="caption" dangerouslySetInnerHTML={processText(payload.caption)} /> : null}
      </div>
    )
  }
}

export class FileMedia extends React.Component {
  render() {
    const { message, className } = this.props
    const { payload } = message

    return (
      <div className={`${className} file`}>
        <a className="file" href={payload.url} target="_blank" rel="noreferrer">
          {FileDownload} {payload.url.replace(/.*\//, '').substr(0, 64)}
        </a>

        {payload.caption ? <div className="caption" dangerouslySetInnerHTML={processText(payload.caption)} /> : null}
      </div>
    )
  }
}
