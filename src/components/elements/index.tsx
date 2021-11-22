import React from 'react'

import Text from './Text'
import { ImageMedia, WebMedia, AudioMedia, VideoMedia, FileMedia } from './Media'
import Template from './Template'
import Location from './Location'
import { Payload } from './types'

interface elementFactory {
  message: { type?: 'text' | 'media' | 'template' | 'location'; payload?: Payload }
  attrs: any
}

export default function elementFactory({ type, payload }, attrs): React.FC {
  let element = null

  if (type === 'text') {
    element = <Text {...attrs} />
  }

  if (type === 'media' && payload.kind === 'image') {
    element = <ImageMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'web') {
    element = <WebMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'audio') {
    element = <AudioMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'video') {
    element = <VideoMedia {...attrs} />
  }

  if (type === 'media' && payload.kind === 'file') {
    element = <FileMedia {...attrs} />
  }

  if (type === 'template') {
    element = <Template {...attrs} />
  }

  if (type === 'location') {
    element = <Location {...attrs} />
  }

  return element
}
