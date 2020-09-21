import React from 'react'

import InputMethodContainer from './InputMethodContainer'
import { RadioOn, RadioOff } from '../icons'
import { chatLabel } from '../../common/labels'

export default class SingleItemPicker extends React.Component {
  state = {
    hasSubmitted: false,
    selectedItem: null,
  }

  componentWillMount() {
    const { default_value, items } = this.props.config
    if (default_value) {
      const item = items.find(({ value }) => value === default_value)
      if (item) {
        this.setState({ selectedItem: item })
      }
    }
  }

  submit = () => {
    if (this.state.selectedItem) {
      this.submitItem(this.state.selectedItem)
    }
  }

  submitItem({ value, title }) {
    this.setState({ hasSubmitted: true })
    this.props.inputModal.finish('message', { type: 'item_picker', text: title, data: value }, this.props.config)
  }

  itemClick(item) {
    if (this.props.config.confirm) {
      this.setState({ selectedItem: item })
    } else {
      this.submitItem(item)
    }
  }

  render() {
    const { items, confirm, button_label } = this.props.config

    return (
      <InputMethodContainer
        {...this.props}
        className={`item-picker single ${confirm ? 'confirm' : ''}`}
        below={
          confirm ? (
            <button disabled={!this.state.selectedItem || this.state.hasSubmitted} onClick={this.submit}>
              {button_label || chatLabel(this, 'form_submit_button')}
            </button>
          ) : null
        }
      >
        {items.map((item, index) => {
          const selected = this.state.selectedItem && this.state.selectedItem.value === item.value
          return (
            <div
              className={`${selected ? 'selected' : ''} ${item.image_url ? 'with-image' : ''}`}
              onClick={() => this.itemClick(item)}
              key={index}
            >
              {confirm ? (selected ? RadioOn : RadioOff) : null}
              <div className="c">
                <div className="title">{item.title}</div>
                {item.subtitle ? <div className="subtitle">{item.subtitle}</div> : null}
              </div>
              {item.image_url ? <div className="image" style={{ backgroundImage: `url(${item.image_url})` }} /> : null}
            </div>
          )
        })}
      </InputMethodContainer>
    )
  }
}
