import React, { useEffect, useState } from 'react'
import debounce from 'lodash/debounce'

import { ImageUpload, AudioUpload, FileUpload, LocationShare, Arrow, More, Close } from './icons'
import { isiOS } from '../common/util'
import ChatInputModalWrapper from './ChatInputModalWrapper'
import ChatMessages, { chatMessagesEvents } from './ChatMessages'
import { chatLabel } from '../common/labels'

interface ChatInputProps {
  scrollToBottom: () => void
  handler: any
  settings: any
  onClose: () => void
  online: boolean
  localePrefs: string[]
}

const ChatInput: React.FC<ChatInputProps> = props => {
  const [hasMessage, setHasMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [inputFocus, setInputFocus] = useState(false)
  const [inputMethodOverride, setInputMethodOverride] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState<any>(null)
  const [_input, set_Input] = useState<any>(null)
  const [_blurrer, set_Blurrer] = useState<ReturnType<typeof setTimeout> | null>(null)

  let inputDiv = React.createRef<HTMLDivElement>()
  let input = React.createRef<HTMLInputElement>()

  const showLocationInput = () => {
    setInputMethodOverride({
      type: 'location',
      payload: { zoom: 12, height: 'compact' },
    })
    setMenuOpen(false)
  }

  useEffect(() => {
    if (
      menuOpen === false &&
      inputMethodOverride.type === 'location' &&
      inputMethodOverride.payload.zoom === 12 &&
      inputMethodOverride.payload.height === 'compact' &&
      props.scrollToBottom
    ) {
      props.scrollToBottom()
    }
  }, [inputMethodOverride, menuOpen])

  useEffect(() => {
    if (props.scrollToBottom) {
      props.scrollToBottom()
    }
  }, [props.scrollToBottom])

  const sendMessage = () => {
    const newMessage = message.trim()
    if (newMessage.length > 0) {
      props.handler.send('message', { text: newMessage, input_type: 'keyboard' })
    }
    setMessage('')
    setHasMessage(false)
    if (input.current) {
      const { alwaysFocus } = props.settings
      if (alwaysFocus) {
        input.current.focus()
      } else {
        input.current.blur()
      }
    }
  }

  useEffect(() => {
    if (message === '' && !hasMessage && props.scrollToBottom) {
      props.scrollToBottom()
    }
  }, [message, hasMessage])

  const sendTypingFactory = payload => {
    return () => {
      props.handler.send('typing', payload)
    }
  }

  const sendTypingOn = debounce(sendTypingFactory(true), 1000, { leading: true, trailing: false })
  const sendTypingOff = debounce(sendTypingFactory(false), 1000, { leading: false, trailing: true })

  const onChange = e => {
    const message = e.target.value
    setMessage(message)
    setHasMessage(message.trim().length > 0)
  }

  const onKeyUp = e => {
    const { layout } = props.settings
    if (props.scrollToBottom) {
      props.scrollToBottom()
    }

    if (e.keyCode === 13) {
      sendTypingOn.cancel()
      sendTypingOff.flush()
      sendMessage()
    } else {
      sendTypingOn()
      sendTypingOff()
    }

    if (e.keyCode === 27) {
      if (layout !== 'embedded') {
        if (props.handler.component.props.onClose) {
          props.handler.component.props.onClose()
        }
      } else {
        setMessage('')
        setHasMessage(false)
        setMenuOpen(false)
      }
    }
  }

  const onFocus = () => {
    if (_blurrer) {
      clearTimeout(_blurrer)
      set_Blurrer(null)
    }
    setInputFocus(true)
  }

  const onBlur = () => {
    set_Blurrer(
      setTimeout(() => {
        setInputFocus(false)
        set_Blurrer(null)
      }, 200),
    )
  }

  const upload = accept => {
    props.handler.component.uploader.trigger(accept, file => {
      if (file.size > 10 * 1024 * 1024) {
        alert('File is too large, please select a smaller file.')
        return
      }
      props.handler.sendFile(file)
      if (props.scrollToBottom) {
        props.scrollToBottom()
      }
      setMenuOpen(false)
    })
  }

  const isDisabled = item => {
    return props.settings.chat_config.disabled_inputs?.indexOf(item) >= 0
  }

  const onInputFocus = () => {
    chatMessagesEvents.emit('scrollToBottom')
    setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 200)
    setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 500)

    if (!isiOS()) return
    const mb = inputDiv.current.style.marginBottom
    inputDiv.current.style.marginBottom = mb === '-1px' ? '0' : '-1px'
  }

  const onInputBlur = () => {
    if (!isiOS()) return
    setTimeout(() => {
      const mb = inputDiv.current.style.marginBottom
      inputDiv.current.style.marginBottom = mb === '-1px' ? '0' : '-1px'
    }, 10)
  }

  const renderDocked = () => {
    return (
      <ChatInputModalWrapper
        inputMethodOverride={inputMethodOverride}
        setInputMethodOverride={setInputMethodOverride}
        handler={props.handler}
        componentProps={{ ...props }}
        cancelLabel={chatLabel(props.settings, props.localePrefs, 'cancel')}
      >
        {operatorActive => (
          <div className="chat-input docked" ref={inputDiv}>
            <div className="input">
              {!isDisabled('text') || operatorActive ? (
                <input
                  type="text"
                  value={message}
                  readOnly={!props.online}
                  placeholder={chatLabel(props.settings, props.localePrefs, 'text_input_placeholder')}
                  ref={input}
                  onFocus={() => onInputFocus()}
                  onBlur={() => onInputBlur()}
                  onKeyUp={e => onKeyUp(e)}
                  onChange={e => onChange(e)}
                />
              ) : null}
            </div>
            {!hasMessage && (operatorActive || !isDisabled('location')) ? (
              <button disabled={!props.online} onClick={() => showLocationInput()}>
                {LocationShare}
              </button>
            ) : null}
            {!hasMessage && !isDisabled('image') ? (
              <button disabled={!props.online} onClick={() => upload('image/*,video/*')}>
                {ImageUpload}
              </button>
            ) : null}

            {hasMessage || (isDisabled('image') && isDisabled('location')) ? (
              <button
                className={`send ${hasMessage ? 'has-message' : ''}`}
                disabled={!props.online || !hasMessage}
                onClick={() => sendMessage()}
              >
                {Arrow}
              </button>
            ) : null}
          </div>
        )}
      </ChatInputModalWrapper>
    )
  }

  const renderEmbedded = () => {
    return (
      <ChatInputModalWrapper
        inputMethodOverride={inputMethodOverride}
        setInputMethodOverride={setInputMethodOverride}
        handler={props.handler}
        componentProps={{ ...props }}
        cancelLabel={chatLabel(props.settings, props.localePrefs, 'cancel')}
      >
        {operatorActive => (
          <div className={`chat-input embedded ${menuOpen ? 'menu-open' : ''} ${inputFocus ? 'input-focus' : ''}`}>
            <div className="input-menu">
              <span className="menu">
                {menuOpen ? (
                  <button onClick={() => setMenuOpen((prev: boolean) => !prev)}>{menuOpen ? Close : More}</button>
                ) : null}
                <button disabled={!props.online} onClick={() => showLocationInput()}>
                  {LocationShare}
                </button>
                <button disabled={!props.online} onClick={() => upload('image/*,video/*')}>
                  {ImageUpload}
                </button>
                <button disabled={!props.online} onClick={() => upload('*/*')}>
                  {FileUpload}
                </button>
                <button disabled={!props.online} onClick={() => upload('audio/*')}>
                  {AudioUpload}
                </button>
              </span>
              {!menuOpen ? (
                <button onClick={() => setMenuOpen((prev: boolean) => !prev)}>{menuOpen ? Close : More}</button>
              ) : null}
            </div>

            {!isDisabled('text') || operatorActive ? (
              <div className="input">
                <input
                  type="text"
                  value={message}
                  readOnly={!props.online}
                  placeholder={chatLabel(props.settings, props.localePrefs, 'text_input_placeholder')}
                  ref={input}
                  onKeyUp={e => onKeyUp(e)}
                  onFocus={() => onFocus()}
                  onBlur={() => onBlur()}
                  onChange={e => onChange(e)}
                />
                <button
                  className={`send ${hasMessage ? 'has-message' : ''}`}
                  disabled={!props.online}
                  onClick={() => sendMessage()}
                >
                  {Arrow}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </ChatInputModalWrapper>
    )
  }

  const { layout } = props.settings
  return layout === 'embedded' ? renderEmbedded() : renderDocked()
}
export default ChatInput

// export default class ChatInput extends React.Component<ChatInputProps> {
//   state = {
//     hasMessage: false,
//     message: '',
//     inputFocus: false,
//     inputMethodOverride: null,
//     menuOpen: null,
//   }
//   _input = null
//   _blurrer: ReturnType<typeof setTimeout> | null = null
//   showLocationInput() {
//     this.setState(
//       {
//         inputMethodOverride: {
//           type: 'location',
//           payload: { zoom: 12, height: 'compact' },
//         },
//         menuOpen: false,
//       },
//       () => this.props.scrollToBottom(), //TODO: useEffect
//     )
//   }

//   sendMessage() {
//     const message = this.state.message.trim()
//     if (message.length > 0) {
//       this.props.handler.send('message', { text: message, input_type: 'keyboard' })
//     }
//     this.setState({ message: '', hasMessage: false }, () => this.props.scrollToBottom()) //TODO: useEffect
//     if (this.input.current) {
//       const { alwaysFocus } = this.props.settings
//       if (alwaysFocus) {
//         this.input.current.focus()
//       } else {
//         this.input.current.blur()
//       }
//     }
//   }

//   sendTypingFactory(payload) {
//     return () => {
//       this.props.handler.send('typing', payload)
//     }
//   }

//   sendTypingOn = debounce(this.sendTypingFactory(true), 1000, { leading: true, trailing: false })
//   sendTypingOff = debounce(this.sendTypingFactory(false), 1000, { leading: false, trailing: true })

//   onChange(e) {
//     const message = e.target.value
//     this.setState({ message, hasMessage: message.trim().length > 0 })
//   }

//   onKeyUp(e) {
//     const { layout } = this.props.settings
//     this.props.scrollToBottom() //TODO: useEffect

//     if (e.keyCode === 13) {
//       this.sendTypingOn.cancel()
//       this.sendTypingOff.flush()
//       this.sendMessage()
//     } else {
//       this.sendTypingOn()
//       this.sendTypingOff()
//     }

//     if (e.keyCode === 27) {
//       if (layout !== 'embedded') {
//         if (this.props.handler.component.props.onClose) {
//           this.props.handler.component.props.onClose()
//         }
//       } else {
//         this.setState({ message: '', hasMessage: false, menuOpen: false })
//       }
//     }
//   }

//   onFocus() {
//     if (this._blurrer) {
//       clearTimeout(this._blurrer)
//       this._blurrer = null
//     }
//     this.setState({ inputFocus: true })
//   }

//   onBlur() {
//     this._blurrer = setTimeout(() => {
//       this.setState({ inputFocus: false })
//       this._blurrer = null
//     }, 200)
//   }

//   upload(accept) {
//     this.props.handler.component.uploader.trigger(accept, file => {
//       if (file.size > 10 * 1024 * 1024) {
//         alert('File is too large, please select a smaller file.')
//         return
//       }
//       this.props.handler.sendFile(file)
//       this.props.scrollToBottom() //TODO: useEffect
//       this.setState({ menuOpen: false })
//     })
//   }

//   isDisabled(item) {
//     return this.props.settings.chat_config.disabled_inputs?.indexOf(item) >= 0
//   }

//   onInputFocus() {
//     chatMessagesEvents.emit('scrollToBottom')
//     setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 200)
//     setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 500)

//     if (!isiOS()) return
//     const mb = this.inputDiv.current.style.marginBottom
//     this.inputDiv.current.style.marginBottom = mb === '-1px' ? '0' : '-1px'
//   }

//   onInputBlur() {
//     if (!isiOS()) return
//     setTimeout(() => {
//       const mb = this.inputDiv.current.style.marginBottom
//       this.inputDiv.current.style.marginBottom = mb === '-1px' ? '0' : '-1px'
//     }, 10)
//   }

//   inputDiv = React.createRef<HTMLDivElement>()
//   input = React.createRef<HTMLInputElement>()

//   renderDocked() {
//     return (
//       <ChatInputModalWrapper
//         component={this}
//         cancelLabel={chatLabel(this.props.settings, this.props.localePrefs, 'cancel')}
//       >
//         {operatorActive => (
//           <div className="chat-input docked" ref={this.inputDiv}>
//             <div className="input">
//               {!this.isDisabled('text') || operatorActive ? (
//                 <input
//                   type="text"
//                   value={this.state.message}
//                   readOnly={!this.props.online}
//                   placeholder={chatLabel(this.props.settings, this.props.localePrefs, 'text_input_placeholder')}
//                   ref={this.input}
//                   onFocus={() => this.onInputFocus()}
//                   onBlur={() => this.onInputBlur()}
//                   onKeyUp={e => this.onKeyUp(e)}
//                   onChange={e => this.onChange(e)}
//                 />
//               ) : null}
//             </div>
//             {!this.state.hasMessage && (operatorActive || !this.isDisabled('location')) ? (
//               <button disabled={!this.props.online} onClick={() => this.showLocationInput()}>
//                 {LocationShare}
//               </button>
//             ) : null}
//             {!this.state.hasMessage && !this.isDisabled('image') ? (
//               <button disabled={!this.props.online} onClick={() => this.upload('image/*,video/*')}>
//                 {ImageUpload}
//               </button>
//             ) : null}

//             {this.state.hasMessage || (this.isDisabled('image') && this.isDisabled('location')) ? (
//               <button
//                 className={`send ${this.state.hasMessage ? 'has-message' : ''}`}
//                 disabled={!this.props.online || !this.state.hasMessage}
//                 onClick={() => this.sendMessage()}
//               >
//                 {Arrow}
//               </button>
//             ) : null}
//           </div>
//         )}
//       </ChatInputModalWrapper>
//     )
//   }

//   renderEmbedded() {
//     return (
//       <ChatInputModalWrapper
//         component={this}
//         cancelLabel={chatLabel(this.props.settings, this.props.localePrefs, 'cancel')}
//       >
//         {operatorActive => (
//           <div
//             className={`chat-input embedded ${this.state.menuOpen ? 'menu-open' : ''} ${
//               this.state.inputFocus ? 'input-focus' : ''
//             }`}
//           >
//             <div className="input-menu">
//               <span className="menu">
//                 {this.state.menuOpen ? (
//                   <button onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}>
//                     {this.state.menuOpen ? Close : More}
//                   </button>
//                 ) : null}
//                 <button disabled={!this.props.online} onClick={() => this.showLocationInput()}>
//                   {LocationShare}
//                 </button>
//                 <button disabled={!this.props.online} onClick={() => this.upload('image/*,video/*')}>
//                   {ImageUpload}
//                 </button>
//                 <button disabled={!this.props.online} onClick={() => this.upload('*/*')}>
//                   {FileUpload}
//                 </button>
//                 <button disabled={!this.props.online} onClick={() => this.upload('audio/*')}>
//                   {AudioUpload}
//                 </button>
//               </span>
//               {!this.state.menuOpen ? (
//                 <button onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}>
//                   {this.state.menuOpen ? Close : More}
//                 </button>
//               ) : null}
//             </div>

//             {!this.isDisabled('text') || operatorActive ? (
//               <div className="input">
//                 <input
//                   type="text"
//                   value={this.state.message}
//                   readOnly={!this.props.online}
//                   placeholder={chatLabel(this.props.settings, this.props.localePrefs, 'text_input_placeholder')}
//                   ref={this.input}
//                   onKeyUp={e => this.onKeyUp(e)}
//                   onFocus={() => this.onFocus()}
//                   onBlur={() => this.onBlur()}
//                   onChange={e => this.onChange(e)}
//                 />
//                 <button
//                   className={`send ${this.state.hasMessage ? 'has-message' : ''}`}
//                   disabled={!this.props.online}
//                   onClick={() => this.sendMessage()}
//                 >
//                   {Arrow}
//                 </button>
//               </div>
//             ) : null}
//           </div>
//         )}
//       </ChatInputModalWrapper>
//     )
//   }

//   render() {
//     const { layout } = this.props.settings
//     return layout === 'embedded' ? this.renderEmbedded() : this.renderDocked()
//   }
// }
