import React from 'react'

export default class UploadTrigger extends React.Component {

  state = {
    accept: ''
  }

  onChange(e) {
    if (this.callback && e.target.files && e.target.files.length > 0) {
      this.callback(e.target.files[0])
    }
    this.callback = null
  }

  trigger(accept, callback) {
    this.callback = callback
    this.setState({ accept }, () => this.input.click())
  }

  render() {
    return (
      <input
        className="upload-trigger"
        onChange={this.onChange.bind(this)}
        type="file"
        multiple={false}
        accept={this.state.accept}
        ref={(input) => { this.input = input }}
      />
    )
  }
}
