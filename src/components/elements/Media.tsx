import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { EventEmitter } from 'fbemitter'
import { TextUtil } from '@botsquad/sdk'
import Message, { Media } from './types'
import { FileDownload } from '../icons'
import { ChatHandler } from 'components'

export const mediaEvents = new EventEmitter()

interface ModalProps {
  handler: ChatHandler
  toggleModalPreferHeight: ((condition: boolean) => void) | null
  message: Message<Media>
  className: string
  children: React.ReactNode
}

class ModalWrapper extends React.PureComponent<ModalProps> {
  _component: any = null
  onClick = () => {
    if (this.props.toggleModalPreferHeight) {
      this.props.handler.component.hideModal()
    } else {
      this.props.handler.component.showModal(this.props.message)
    }
  }

  triggerResize = (_: any, component: any, ratio: number) => {
    if (!this.props.toggleModalPreferHeight || (!component && !this._component)) {
      return
    }
    if (component && !this._component) {
      this._component = component
    }

    component = component || this._component

    const { clientWidth, clientHeight, clientRatio } = this.props.handler.getClientDimensions()

    this.props.toggleModalPreferHeight(ratio > clientRatio)

    let w: number
    let h: number
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
    if (this.props.toggleModalPreferHeight) {
      return this.props.children as React.FC
    }

    return (
      <div className={this.props.className}>
        {React.Children.map(this.props.children, child =>
          React.cloneElement(child as ReactElement, { onClick: this.onClick }),
        )}
      </div>
    )
  }
}

interface ImageMediaProps {
  message: Message<Media>
  onLoad: (() => void) | null
  className: string
  handler: ChatHandler
  toggleModalPreferHeight: ((condition: boolean) => void) | null
}

export const ImageMedia: React.FC<ImageMediaProps> = props => {
  const { message, onLoad, className } = props
  const [loading, setLoading] = useState(true)
  const [retry, setRetry] = useState(0)
  const { payload } = message
  let wrapper: ModalWrapper | null = null
  let component: HTMLElement | null = null

  if (loading) {
    const img = document.createElement('img')
    img.onload = () => {
      setLoading(false)
    }
    img.onerror = () => {
      if (retry > 20) return
      setTimeout(() => setRetry(retry + 1), 250 + 50 * Math.pow(retry, 2))
    }
    img.src = payload.url

    return (
      <ModalWrapper
        {...props}
        ref={(w: any) => {
          wrapper = w
        }}
      >
        <span className="loading" />
      </ModalWrapper>
    )
  }
  return (
    <ModalWrapper
      {...props}
      className={`image ${className}`}
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
              wrapper.triggerResize(
                event,
                component,
                (event.target as HTMLImageElement).height / (event.target as HTMLImageElement).width,
              )
            }
          }}
        />
        {payload.caption ? (
          <div className="caption" dangerouslySetInnerHTML={TextUtil.processText(payload.caption)} />
        ) : null}
      </div>
    </ModalWrapper>
  )
}
enum ASPECTS {
  'default' = 0.5625,
  'two-by-three' = 1.5,
  'three-by-four' = 1.333,
  'square' = 1,
  'four-by-three' = 0.75,
  'three-by-two' = 0.666,
  'two-by-one' = 0.5,
}
function determineAspect(cls: string) {
  return (cls || '').split(' ').reduce((acc: string, c: string) => acc || ASPECTS[c], false) || ASPECTS.default
}

interface WebMediaProps {
  message: Message<Media>
  onLoad: (() => void) | null
  toggleModalPreferHeight: ((condition: boolean) => void) | null

  className: string
  handler: ChatHandler
}

const WebMediaNonMemoized: React.FC<WebMediaProps> = props => {
  const { message, onLoad } = props
  const { payload } = message
  const { preview_image } = payload
  let component: HTMLDivElement | null = null
  let wrapper: ModalWrapper | null = null
  const aspect = determineAspect(payload.class)
  const tryResize = (t: number | null) => {
    const resize = () => wrapper && component && wrapper.triggerResize(null, component, aspect)
    setTimeout(resize, 0)
    if (t) setTimeout(resize, t)
  }

  return (
    <ModalWrapper
      {...props}
      className={`web ${props.className}`}
      ref={w => {
        wrapper = w
        tryResize(100)
      }}
    >
      {preview_image && !props.toggleModalPreferHeight ? (
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
                tryResize(null)
              }}
            />
          </div>
          {payload.caption ? (
            <div className="caption" dangerouslySetInnerHTML={TextUtil.processText(payload.caption)} />
          ) : null}
        </div>
      )}
    </ModalWrapper>
  )
}

export const WebMedia = React.memo(
  WebMediaNonMemoized,
  (props, nextProps) => props.message.payload.url === nextProps.message.payload.url,
)

interface AudioMediaProps {
  message: Message<Media>
  className: string
  handler: ChatHandler
}

export const AudioMedia: React.FC<AudioMediaProps> = React.memo(
  ({ message, className, handler }) => {
    const audio = useRef<HTMLAudioElement>(null)
    const [hasAudio, setHasAudio] = useState(false)

    useEffect(() => {
      const audioTemp: HTMLAudioElement | null = audio.current

      handler.attachAudio(audio)
      if (audioTemp) {
        audioTemp.addEventListener('play', () => {
          mediaEvents.emit('audio.create', audio)
          setHasAudio(true)
        })
        audioTemp.addEventListener('ended', () => {
          handler.send('event', { name: '$audio_ended', payload: { url: message.payload.url } })
        })
      }
      return () => {
        if (hasAudio) {
          mediaEvents.emit('audio.destroy')
          setHasAudio(false)
        }
      }
    }, [])

    const { payload } = message

    return (
      <div className={`${className} audio`}>
        <audio src={payload.url} controls ref={audio} />
        {payload.caption ? (
          <div className="caption" dangerouslySetInnerHTML={TextUtil.processText(payload.caption)} />
        ) : null}
      </div>
    )
  },
  (props, nextProps) => {
    return props.message.payload.url === nextProps.message.payload.url
  },
)

AudioMedia.displayName = 'AudioMedia'

interface VideoMediaProps {
  message: Message<Media>
  className: string
}

export const VideoMedia: React.FC<VideoMediaProps> = React.memo(
  ({ message, className }) => {
    const { payload } = message

    return (
      <div className={`${className} video`}>
        <video src={payload.url} controls />
        {payload.caption ? (
          <div className="caption" dangerouslySetInnerHTML={TextUtil.processText(payload.caption)} />
        ) : null}
      </div>
    )
  },
  (props, nextProps) => {
    return props.message.payload.url === nextProps.message.payload.url
  },
)

VideoMedia.displayName = 'VideoMedia'

interface FileMediaProps {
  message: Message<Media>
  className: string
}
export const FileMedia: React.FC<FileMediaProps> = ({ message, className }) => {
  const { payload } = message

  const filename = payload.url.replace(/.*\//, '').substr(0, 64)

  return (
    <div className={`${className} file`}>
      <a className="file" href={payload.url} target="_blank" rel="noreferrer">
        {FileDownload} {payload.caption || filename}
      </a>
    </div>
  )
}
