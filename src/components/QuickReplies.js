import React from 'react'

function askForLocation(handler) {
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    handler.send('location', { lat: coords.latitude, lon: coords.longitude })
  })
}

function uploadImage(handler) {
  handler.component.uploader.trigger('image/*', (file) => {
    handler.sendFile(file)
  })
}

function renderButton({ content_type, title, image_url }, idx, handler) {
  const icon = undefined

  if (content_type === 'image') {
    return (
      <div className="button" key={idx} onClick={() => uploadImage(handler)}>
        <span className="label">Upload image</span>
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
        { image_url &&
          <div className="icon">
            <img src={image_url} />
          </div>
        }
        <span className="label">{title}</span>
      </div>
    )
  }

  return null
}

export default function QuickReplies(props) {
  const { buttons, handler, className } = props

  return (
    <div className={`quick-replies ${className || ''}`}>
      {buttons.map((b, idx) => renderButton(b, idx, handler))}
    </div>)
}
