import React from 'react'

type Callback = ((file: any) => void) | null
type Event = React.FormEvent<HTMLInputElement>

export default class UploadTrigger extends React.Component {
  state = {
    accept: '',
  }
  callback: Callback = null
  input: HTMLInputElement | null = null

  onChange = (e: Event) => {
    if (this.callback && (e.target as HTMLInputElement).files && (e.target as HTMLInputElement).files.length > 0) {
      this.callback((e.target as HTMLInputElement).files[0])
    }
    this.callback = null
  }

  trigger(accept: string, callback: Callback) {
    this.callback = callback
    // Since this function is called externally the input will always be non-null (the component will be rendered by then )
    if (this.input && this.input.click) this.setState({ accept }, () => this.input.click())
  }

  render() {
    return (
      <input
        className="upload-trigger"
        onChange={this.onChange}
        type="file"
        multiple={false}
        accept={this.state.accept}
        ref={input => {
          this.input = input
        }}
      />
    )
  }
}
