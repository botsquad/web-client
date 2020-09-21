import React from 'react'

export default function ChatToast({ toast }) {
  const { message } = toast

  return <div className={`chat-toast--wrapper ${this.props.hiding ? 'hiding' : ''}`}>{message}</div>
}
