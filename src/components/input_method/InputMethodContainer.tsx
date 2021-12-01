import React, { useEffect } from 'react'
import { Close } from '../icons'
import { useInputMethodProps } from './InputMethodContext'

interface InputMethodContainerProps {
  className: string
  below: React.ReactNode
  headerControl?: React.ReactNode
  children?: React.ReactNode
}

enum SizeMap {
  Compact = 0.5,
  Tall = 0.75,
  Full = 1,
}

const InputMethodContainer: React.FC<InputMethodContainerProps> = ({ below, headerControl, className, children }) => {
  const { config, handler, inputModal, inline } = useInputMethodProps()
  const { required, caption, height } = config

  const cancel = () => {
    if (inputModal && inputModal.cancel) inputModal.cancel()
  }

  const renderHeader = (caption: string, required: boolean) => {
    return (
      <div className={`input-method-header ${caption ? 'captioned' : ''}`}>
        {caption ? <span>{caption}</span> : null}
        {!required && !inline ? (
          <span className="controls">
            <span onClick={cancel}>{Close}</span>
          </span>
        ) : null}
      </div>
    )
  }

  const classList = `input-method--container ${height} ${className || ''} rest`.split(' ')

  let inlineStyle: {
    height?: string
    maxHeight?: string
  } = {}

  useEffect(() => {
    inlineStyle = {}
    const { required, caption } = config
    const { clientHeight } = handler.getClientDimensions()
    const maxHeight = required && !caption ? clientHeight : clientHeight + 45

    if (classList.includes('qr') || classList.includes('barcode')) {
      return
    }

    let size = SizeMap.Compact
    if (classList.includes('tall')) size = SizeMap.Tall
    if (classList.includes('full')) size = SizeMap.Full
    const attr = classList.includes('fixed-height') ? 'height' : 'maxHeight'
    inlineStyle[attr] = `${Math.floor(size * maxHeight)}px`
  }, [])

  return (
    <div className={classList.join(' ')} style={inlineStyle}>
      {!required || caption ? renderHeader(caption, required) : null}
      {headerControl && (
        <div className="input-method-header">
          <span className="controls">{headerControl}</span>
        </div>
      )}
      <div className="content">{children}</div>
      {below ? <div className="below">{below}</div> : null}
    </div>
  )
}

export default InputMethodContainer
