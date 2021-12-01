import React, { useEffect, useState } from 'react'

import InputMethodContainer from './InputMethodContainer'
import { RadioOn, RadioOff } from '../icons'
import { chatLabel } from '../../common/labels'
import { useInputMethodProps } from './InputMethodContext'

interface SingleItemPickerProps {
  settings: any
  localePrefs: string[]
}

const SingleItemPicker: React.FC<SingleItemPickerProps> = ({ settings, localePrefs }) => {
  const { config, inputModal } = useInputMethodProps()
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    const { default_value, items } = config
    if (default_value) {
      const item = items.find(({ value }) => value === default_value)
      if (item) {
        setSelectedItem(item)
      }
    }
  }, [])

  const submit = () => {
    if (selectedItem) {
      submitItem(selectedItem)
    }
  }

  const submitItem = ({ value, title }) => {
    setHasSubmitted(true)
    inputModal!.finish('message', { type: 'item_picker', text: title, data: value }, config)
  }

  const itemClick = (item: any) => {
    if (config.confirm) {
      setSelectedItem(item)
    } else {
      submitItem(item)
    }
  }

  const { items, confirm, button_label } = config

  return (
    <InputMethodContainer
      className={`item-picker single ${confirm ? 'confirm' : ''}`}
      below={
        confirm ? (
          <button disabled={!selectedItem || hasSubmitted} onClick={submit}>
            {button_label || chatLabel(settings, localePrefs, 'form_submit_button')}
          </button>
        ) : null
      }
    >
      {items.map((item: any, index: number) => {
        const selected = selectedItem && selectedItem.value === item.value
        return (
          <div
            className={`${selected ? 'selected' : ''} ${item.image_url ? 'with-image' : ''}`}
            onClick={() => itemClick(item)}
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

export default SingleItemPicker
