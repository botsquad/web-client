import React from 'react'

import InputMethodContainer from './InputMethodContainer'
import { CheckboxOn, CheckboxOff } from '../icons'
import { chatLabel } from '../../common/labels'

export default class extends React.Component {
  state = {
    hasSubmitted: false,
    selected: [],
  }

  componentWillMount() {
    const { default_value, items } = this.props.config
    if (Array.isArray(default_value)) {
      const selected = items.filter(({ value }) => default_value.find(v => v === value))
      this.setState({ selected })
    }
  }

  submit = () => {
    const { selected } = this.state
    if (selected.length === 0) {
      return
    }

    const text = selected.map(({ title }) => title).join(', ')
    const data = selected.map(({ value }) => value)

    this.setState({ hasSubmitted: true })
    this.props.inputModal.finish('message', { type: 'item_picker', text, data }, this.props.config)
  }

  itemClick(item) {
    let { selected } = this.state
    if (selected.find(i => i.value === item.value)) {
      // remove
      selected = selected.filter(i => i.value !== item.value)
    } else {
      selected.push(item)
    }
    selected.sort((a, b) => {
      if (a.value < b.value) return -1;
      if (a.value > b.value) return 1;
      return 0;
    })
    this.setState({ selected })
  }

  render() {
    const { items, button_label } = this.props.config

    return (
      <InputMethodContainer
        {...this.props}
        className="item-picker multiple confirm"
        below={<button disabled={this.state.selected.length === 0 || this.state.hasSubmitted} onClick={this.submit}>{button_label || chatLabel(this, 'form_submit_button')}</button>}
      >
        {items.map(
          (item, index) => {
            const selected = this.state.selected.find(i => i.value === item.value)
            return (
              <div
                className={`${selected ? 'selected' : ''} ${item.image_url ? 'with-image' : ''}`}
                onClick={() => this.itemClick(item)}
                key={index}
              >
                {selected ? CheckboxOn : CheckboxOff}
                <div className="c">
                  <div className="title">{item.title}</div>
                  {item.subtitle ? <div className="subtitle">{item.subtitle}</div> : null}
                </div>
                {item.image_url ? <div className="image" style={{ backgroundImage: `url(${item.image_url})` }} /> : null}
              </div>
            )
          }
        )}
      </InputMethodContainer>
    )
  }
}
