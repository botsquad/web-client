import React from 'react'
import { chatLabel } from '../common/labels'
import { useChatProps } from './ChatContext'

function askForLocation(handler: any) {
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    handler.send('location', { lat: coords.latitude, lon: coords.longitude })
  })
}

function fileUpload(accept: any, handler: any) {
  handler.component.uploader.trigger(accept, file => {
    handler.sendFile(file)
  })
}

enum FILE_UPLOADS {
  file = '',
  image = 'image/*',
  audio = 'audio/*',
  video = 'video/*',
}

function renderButton(
  { content_type, title, image_url }: { content_type: string; title: string; image_url: string },
  idx: number,
  handler: any,
  settings: any,
  localePrefs: string[],
) {
  if (FILE_UPLOADS[content_type] !== undefined) {
    return (
      <div className="button" key={idx} onClick={() => fileUpload(FILE_UPLOADS[content_type], handler)}>
        <span className="label">{chatLabel(settings, localePrefs, content_type + '_picker_select')}</span>
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
    return (
      <div className="button" key={idx} onClick={() => handler.send('message', { text: title, input_type: 'touch' })}>
        {image_url && (
          <div className="icon">
            <img src={image_url} alt="icon" />
          </div>
        )}
        <span className="label">{title}</span>
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
  return (
    <div className={`quick-replies ${className || ''}`}>
      {buttons.map((b, idx) => renderButton(b, idx, handler, settings, localePrefs))}
    </div>
  )
}
export default QuickReplies
