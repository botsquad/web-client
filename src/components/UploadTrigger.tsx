import React from 'react'

export type Callback = ((file: any) => void) | null
export type Capture = 'user' | 'environment'

type State = { accept: string; uploadCount: number; capture?: Capture }

export default class UploadTrigger extends React.Component<Record<string, unknown>, State> {
  state: State = {
    accept: '',
    uploadCount: 0,
    capture: undefined,
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

  trigger(accept: string, callback: Callback, capture?: Capture) {
    this.callback = callback
    this.setState({ accept, capture }, () => this.input.current?.click())
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
        capture={this.state.capture}
        ref={this.input}
      />
    )
  }
}
