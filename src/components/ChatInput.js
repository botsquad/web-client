import React from 'react'
import debounce from 'lodash/debounce'

import { ImageUpload, AudioUpload, FileUpload, LocationShare, Arrow, More, Close } from './icons'
import { isiOS, isiPad, isMobile } from '../common/util'
import ChatInputModal from './ChatInputModal'
import { chatMessagesEvents } from './ChatMessages'
import { chatLabel } from '../common/labels'

class ChatInputModalWrapper extends React.Component {
  cancel = () => {
    const { component, cancelLabel } = this.props
    if (component.state.inputMethodOverride) {
      component.setState({ inputMethodOverride: null })
    } else {
      component.props.handler.send('message', { type: 'cancel', text: cancelLabel })
    }
  }

  finish = () => {
    const { component } = this.props
    component.setState({ inputMethodOverride: null })
  }

  render() {
    const { children, component } = this.props
    return (
      <ChatInputModal {...component.props} onCancel={this.cancel} onFinish={this.finish} inputMethodOverride={component.state.inputMethodOverride}>
        {children}
      </ChatInputModal>
    )
  }
}

export default class ChatInput extends React.Component {
  state = {
    hasMessage: false,
    message: '',
    inputFocus: false,
    inputMethodOverride: null
  }
  _input = null

  showLocationInput() {
    this.setState(
      { inputMethodOverride: {type: 'location', payload: { zoom: 12, height: 'compact' } }, menuOpen: false },
      () => this.props.chatMessages.scrollToBottom()
    )
  }

  sendMessage() {
    const message = this.state.message.trim()
    if (message.length > 0) {
      this.props.handler.send('message', message)
    }
    this.setState({ message: '', hasMessage: false }, () => this.props.chatMessages.scrollToBottom())
    if (this.input) {
      const { alwaysFocus } = this.props.settings
      alwaysFocus ? this.input.focus() : this.input.blur()
    }
  }

  sendTypingFactory(payload) {
    return () => {
      this.props.handler.send('typing', payload)
    }
  }

  sendTypingOn = debounce(this.sendTypingFactory(true), 1000, { leading: true, trailing: false })
  sendTypingOff = debounce(this.sendTypingFactory(false), 1000, { leading: false, trailing: true })

  onChange(e) {
    const message = e.target.value
    this.setState({ message, hasMessage: message.trim().length > 0 })
  }

  onKeyUp(e) {
    const { layout } = this.props.settings
    this.props.chatMessages.scrollToBottom()

    if (e.keyCode === 13) {
      this.sendTypingOn.cancel()
      this.sendTypingOff.flush()
      this.sendMessage()
    } else {
      this.sendTypingOn()
      this.sendTypingOff()
    }

    if (e.keyCode === 27) {
      if (layout !== 'embedded') {
        this.props.handler.component.props.onClose && this.props.handler.component.props.onClose()
      } else {
        this.setState({ message: '', hasMessage: false, menuOpen: false })
      }
    }
  }

  onFocus() {
    if (this._blurrer) {
      clearTimeout(this._blurrer)
      this._blurrer = null
    }
    this.setState({ inputFocus: true })
  }

  onBlur() {
    this._blurrer = setTimeout(() => {
      this.setState({ inputFocus: false })
      this._blurrer = null
    }, 200)
  }

  upload(accept) {
    this.props.handler.component.uploader.trigger(accept, (file) => {
      this.props.handler.sendFile(file)
      this.props.chatMessages.scrollToBottom()
      this.setState({ menuOpen: false })
    })
  }

  isDisabled(item) {
    return this.props.settings.chat_config.disabled_inputs?.indexOf(item) >= 0
  }

  onInputFocus() {
    chatMessagesEvents.emit('scrollToBottom')
    setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 200)
    setTimeout(() => chatMessagesEvents.emit('scrollToBottom'), 500)

    if (!isiOS()) return
    const mb = this.inputDiv.style.marginBottom
    this.inputDiv.style.marginBottom = mb === '-1px' ? '0' : '-1px'
  }

  onInputBlur() {
    if (!isiOS()) return
    setTimeout(() => {
      const mb = this.inputDiv.style.marginBottom
      this.inputDiv.style.marginBottom = mb === '-1px' ? '0' : '-1px'
    }, 10)
  }

  renderDocked() {
    return (
      <ChatInputModalWrapper component={this} cancelLabel={chatLabel(this, 'cancel')}>
        {operatorActive =>
          <div className="chat-input docked" ref={inputDiv => { this.inputDiv = inputDiv }}>
            <div className="input">
              {(!this.isDisabled('text') || operatorActive)
              ? <input type="text" value={this.state.message}
                  readOnly={!this.props.online}
                  placeholder={chatLabel(this, 'text_input_placeholder')}
                  ref={input => { this.input = input }}
                  onFocus={() => this.onInputFocus()}
                  onBlur={() => this.onInputBlur()}
                  onKeyUp={e => this.onKeyUp(e)}
                  onChange={e => this.onChange(e)}
              />
              : null}
            </div>
            {!this.state.hasMessage && (operatorActive || !this.isDisabled('location')) ? <button disabled={!this.props.online} onClick={() => this.showLocationInput()}>{LocationShare}</button> : null}
            {!this.state.hasMessage && !this.isDisabled('image') ? <button disabled={!this.props.online} onClick={() => this.upload('image/*,video/*')}>{ImageUpload}</button> : null}

            {this.state.hasMessage || (this.isDisabled('image') && this.isDisabled('location'))
            ? <button className={`send ${this.state.hasMessage ? 'has-message' : ''}`} disabled={!this.props.online || !this.state.hasMessage} onClick={() => this.sendMessage()}>{Arrow}</button>
            : null}
          </div>}
      </ChatInputModalWrapper>
    )
  }

  renderEmbedded() {
    return (
      <ChatInputModalWrapper component={this} cancelLabel={chatLabel(this, 'cancel')}>
        {operatorActive =>
          <div className={`chat-input embedded ${this.state.menuOpen ? 'menu-open' : ''} ${this.state.inputFocus ? 'input-focus' : ''}`}>
            <div className="input-menu">
              <span className="menu">
                {this.state.menuOpen ? <button onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}>{this.state.menuOpen ? Close : More}</button> : null}
                <button disabled={!this.props.online} onClick={() => this.showLocationInput()}>{LocationShare}</button>
                <button disabled={!this.props.online} onClick={() => this.upload('image/*,video/*')}>{ImageUpload}</button>
                <button disabled={!this.props.online} onClick={() => this.upload('*/*')}>{FileUpload}</button>
                <button disabled={!this.props.online} onClick={() => this.upload('audio/*')}>{AudioUpload}</button>
              </span>
              {!this.state.menuOpen ? <button onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}>{this.state.menuOpen ? Close : More}</button> : null}
            </div>

            {(!this.isDisabled('text') || operatorActive)
            ? <>
              <div className="input">
                <input type="text" value={this.state.message}
                  readOnly={!this.props.online}
                  placeholder={chatLabel(this, 'text_input_placeholder')}
                  ref={input => { this.input = input }}
                  onKeyUp={e => this.onKeyUp(e)}
                  onFocus={() => this.onFocus()}
                  onBlur={() => this.onBlur()}
                  onChange={e => this.onChange(e)}
                />
                <button className={`send ${this.state.hasMessage ? 'has-message' : ''}`} disabled={!this.props.online} onClick={() => this.sendMessage()}>{Arrow}</button>
              </div>
            </>
            : null}
          </div>
        }
      </ChatInputModalWrapper>
    )
  }

  render() {
    const { layout } = this.props.settings
    return layout === 'embedded' ? this.renderEmbedded() : this.renderDocked()
  }

}
