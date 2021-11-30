import React, { useEffect, useState } from 'react'

import InputMethodContainer from './InputMethodContainer'
import { CheckboxOn, CheckboxOff } from '../icons'
import { chatLabel } from '../../common/labels'

interface MultiItemPickerProps {
  config: any
  inputModal: any
  settings: any
  localePrefs: string[]
}

const MultiItemPicker: React.FC<MultiItemPickerProps> = props => {
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [selected, setSelected] = useState<any[]>([])

  useEffect(() => {
    const { default_value, items } = props.config
    if (Array.isArray(default_value)) {
      const selected = items.filter(({ value }) => default_value.find(v => v === value))
      setSelected(selected)
    }
  }, [])

  const submit = () => {
    if (selected.length === 0) {
      return
    }

    const text = selected.map(({ title }) => title).join(', ')
    const data = selected.map(({ value }) => value)

    setHasSubmitted(true)
    props.inputModal.finish('message', { type: 'item_picker', text, data }, props.config)
  }

  const itemClick = item => {
    let newSelected = [...selected]
    if (newSelected.find(i => i.value === item.value)) {
      // remove
      newSelected = newSelected.filter(i => i.value !== item.value)
    } else {
      newSelected.push(item)
    }
    selected.sort((a, b) => {
      if (a.value < b.value) return -1
      if (a.value > b.value) return 1
      return 0
    })
    setSelected(newSelected)
  }

  const { items, button_label } = props.config

  return (
    <InputMethodContainer
      className="item-picker multiple confirm"
      below={
        <button disabled={selected.length === 0 || hasSubmitted} onClick={submit}>
          {button_label || chatLabel(props.settings, props.localePrefs, 'form_submit_button')}
        </button>
      }
    >
      {items.map((item, index: number) => {
        const newSelected = selected.find(i => i.value === item.value)
        return (
          <div
            className={`${newSelected ? 'selected' : ''} ${item.image_url ? 'with-image' : ''}`}
            onClick={() => itemClick(item)}
            key={index}
          >
            {newSelected ? CheckboxOn : CheckboxOff}
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

export default MultiItemPicker
