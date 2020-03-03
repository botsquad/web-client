import React from 'react'

export default class ChatToast extends React.Component {
  render() {
    const { message } = this.props.toast

    return (
      <div className={`chat-toast--wrapper ${this.props.hiding ? 'hiding' : ''}`}>
        {message}
      </div>
    )
  }
}
