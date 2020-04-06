import React from 'react'
import findLastIndex from 'lodash/findLastIndex'
import isEqual from 'lodash/isEqual'

import inputMethodFactory from './input_method'

export default class extends React.Component {
  state = {
    inputMethod: null,
    operatorActive: false,
  }

  componentWillMount() {
    this._checkShowInputModal()
  }

  componentWillReceiveProps() {
    setTimeout(() => this._checkShowInputModal(), 0)
  }

  cancel() {
    this.props.onCancel()
    this.forceUpdate()
  }

  finish(type, payload) {
    this.props.handler.send(type, payload)
    this.props.onFinish()
    setTimeout(() => this.forceUpdate(), 0)
  }

  _checkShowInputModal() {
    const inputIndex = findLastIndex(this.props.events, { type: 'input_method' })
    const renderableIndex = findLastIndex(this.props.events, { renderable: true })

    const operatorActive = this.props.conversationMeta?.operator_present

    this.setState({ operatorActive })

    if (inputIndex === -1 || inputIndex < renderableIndex || operatorActive) {
      if (this.state.inputMethod !== null) {
        this.setState({ inputMethod: null })
        this.scrollToBottom()
      }
    } else {
      const event = this.props.events[inputIndex]
      const inputMethod = { ...event.payload, time: event.time || (new Date()).getTime() }
      if (!isEqual(this.state.inputMethod, inputMethod)) {
        this.setState({ inputMethod })
        this.scrollToBottom()
      }
    }
  }

  scrollToBottom() {
    if (this.props.chatMessages) {
      setTimeout(() => this.props.chatMessages.scrollToBottom(), 50)
    }
  }

  isDisabled(item) {
    return this.props.settings.chat_config.disabled_inputs?.indexOf(item) >= 0
  }

  allDisabled() {
    return this.props.settings.hide_input || (this.isDisabled('text') && this.isDisabled('location') && this.isDisabled('image'))
  }

  render() {
    const method = this.state.inputMethod || this.props.inputMethodOverride
    if (method) {
      return inputMethodFactory(method, this.props, this)
    }

    if (this.allDisabled() && !this.state.operatorActive) {
      return null
    }

    return this.props.children(this.state.operatorActive)
  }
}
