import React from 'react'
import { Close } from '../icons'

export default class extends React.Component {
  cancel = () => {
    this.props.inputModal.cancel()
  }

  renderHeader(caption, required) {
    return (
      <div className={`input-method-header ${caption ? 'captioned' : ''}`}>
        {caption ? <span>{caption}</span> : null}
        {!required && !this.props.inline ? <span className="controls"><span onClick={this.cancel}>{Close}</span></span> : null}
      </div>
    )
  }

  render() {
    const { config, className, below, headerControl } = this.props
    const { required, caption, height } = config

    return (
      <div className={`input-method--container ${height} ${className || ''} ${this.props.class || ''}`} ref={(r) => { this.div = r }}>
        {(!required || caption)
        ? this.renderHeader(caption, required)
        : null}
        {headerControl && <div className="input-method-header"><span className="controls">{headerControl}</span></div>}
        <div className="content">
          {this.props.children}
        </div>
        {below ? <div className="below">{below}</div> : null}
      </div>
    )
  }

  componentDidMount() {
    const { required, caption } = this.props.config
    const { clientHeight } = this.props.handler.getClientDimensions()
    const maxHeight = required && !caption ? clientHeight : clientHeight + 45

    const { style, classList } = this.div
    if (classList.contains('qr') || classList.contains('barcode')) {
      return
    }

    let size = 'compact'
    if (classList.contains('tall')) size = 'tall'
    if (classList.contains('full')) size = 'full'
    const sizeMap = { full: 1, compact: 0.5, tall: 0.75 }
    const attr = classList.contains('fixed-height') ? 'height' : 'max-height'
    style[attr] = Math.floor(sizeMap[size] * maxHeight) + 'px'
  }
}
