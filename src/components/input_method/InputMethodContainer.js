import React from 'react'
import { Close } from '../icons'

export default class InputMethodContainer extends React.Component {
  cancel = () => {
    this.props.inputModal.cancel()
  }

  renderHeader(caption, required) {
    return (
      <div className={`input-method-header ${caption ? 'captioned' : ''}`}>
        {caption ? <span>{caption}</span> : null}
        {!required && !this.props.inline ? (
          <span className="controls">
            <span onClick={this.cancel}>{Close}</span>
          </span>
        ) : null}
      </div>
    )
  }

  render() {
    const { config, className, below, headerControl } = this.props
    const { required, caption, height } = config

    return (
      <div
        className={`input-method--container ${height} ${className || ''} ${this.props.class || ''}`}
        ref={r => {
          this.div = r
        }}
      >
        {!required || caption ? this.renderHeader(caption, required) : null}
        {headerControl && (
          <div className="input-method-header">
            <span className="controls">{headerControl}</span>
          </div>
        )}
        <div className="content">{this.props.children}</div>
        {below ? <div className="below">{below}</div> : null}
      </div>
    )
  }
}
