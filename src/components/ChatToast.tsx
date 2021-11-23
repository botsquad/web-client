import React from 'react'

interface ChatToastProps {
  toast: { message: string } //🍞
  hiding: boolean //🐱‍👤
}

const ChatToast: React.FC<ChatToastProps> = ({ toast, hiding }) => {
  const { message } = toast

  return <div className={`chat-toast--wrapper ${hiding ? 'hiding' : ''}`}>{message}</div>
}
export default ChatToast
