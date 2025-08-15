import { TextUtil } from '@botsquad/sdk'
import { ChatHandler } from 'components'
import React from 'react'
import { chatLabel } from '../common/labels'
import { useChatProps } from './ChatContext'
import { Capture } from './UploadTrigger'

function askForLocation(handler: any) {
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    handler.send('user_location', { lat: coords.latitude, lon: coords.longitude })
  })
}

function fileUpload(accept: string, handler: any, capture?: Capture) {
  handler.component.uploader.trigger(
    accept,
    (file: File) => {
      handler.sendFile(file)
    },
    capture,
  )
}

const FILE_UPLOADS = {
  file: '',
  image: 'image/*',
  audio: 'audio/*',
  video: 'video/*',
}

type ContentType = keyof typeof FILE_UPLOADS | 'location' | 'text'

function renderButton(
  {
    content_type,
    title,
    image_url,
    capture,
  }: { content_type: ContentType; title: string; image_url: string; capture?: string },
  idx: number,
  handler: ChatHandler,
  settings: Record<string, any>,
  localePrefs: string[],
) {
  if (FILE_UPLOADS.hasOwnProperty(content_type)) {
    const label = capture ? content_type + '_' + capture + '_picker_select' : content_type + '_picker_select'
    return (
      <div
        className="button"
        key={idx}
        onClick={() => fileUpload(FILE_UPLOADS[content_type as keyof typeof FILE_UPLOADS], handler, capture as Capture)}
      >
        <span className="label">{chatLabel(settings as { ui_labels: any }, localePrefs, label)}</span>
      </div>
    )
  }

  if (content_type === 'location') {
    return (
      <div className="button" key={idx} onClick={() => askForLocation(handler)}>
        <span className="label">Share your location</span>
      </div>
    )
  }

  if (content_type === 'text') {
    const innerHTML = TextUtil.processText(title)
    return (
      <div
        className="button"
        key={idx}
        onClick={() => {
          const span = document.createElement('span')
          span.innerHTML = innerHTML.__html
          handler.send('user_message', { text: span.innerText.trim(), input_type: 'touch' })
        }}
      >
        {image_url && (
          <div className="icon">
            <img src={image_url} alt="icon" />
          </div>
        )}
        <span className="label" dangerouslySetInnerHTML={innerHTML} />
      </div>
    )
  }

  return null
}

interface QuickRepliesProps {
  buttons: { content_type: string; title: string; image_url: string }[]
  className: string
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ buttons, className }) => {
  const { handler, settings, localePrefs } = useChatProps()
  if (settings)
    return (
      <div className={`quick-replies ${className || ''}`}>
        {buttons.map((b, idx) => renderButton(b as any, idx, handler, settings, localePrefs))}
      </div>
    )
  else {
    return null
  }
}
export default QuickReplies
