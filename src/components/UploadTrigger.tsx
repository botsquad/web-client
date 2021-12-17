import React from 'react'

type Callback = ((file: any) => void) | null

type State = { accept: string; uploadCount: number }

export default class UploadTrigger extends React.Component<Record<string, unknown>, State> {
  state: State = {
    accept: '',
    uploadCount: 0,
  }
  callback: Callback = null
  input = React.createRef<HTMLInputElement>()

  onChange = () => {
    const file = this.input.current?.files?.[0]
    if (!this.callback || !file) {
      return
    }
    this.callback(file)
    this.callback = null
    this.setState({ uploadCount: this.state.uploadCount + 1 })
  }

  trigger(accept: string, callback: Callback) {
    this.callback = callback
    this.setState({ accept }, () => this.input.current?.click())
  }

  render() {
    return (
      <input
        key={this.state.uploadCount}
        className="upload-trigger"
        onChange={this.onChange}
        type="file"
        multiple={false}
        accept={this.state.accept}
        ref={this.input}
      />
    )
  }
}
