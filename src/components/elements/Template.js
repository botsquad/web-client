import React from 'react'
import Slider from 'react-slick'

import InputMethodTemplate from './InputMethodTemplate'
import { OpenModal, ArrowLeft, ArrowRight } from '../icons'
import { processText } from './util'

import './css/slick.min.css'

export function buttonClick(button, handler, handleEvent) {
  let payload

  if (button.hide_modal) {
    handler.component.hideModal()
  }
  switch (button.type) {
    case 'postback':
      handler.send('event', { name: button.payload, payload: {} })
      break
    case 'event':
      payload = { name: button.event, payload: button.json ? JSON.parse(button.json) : button.payload }
      handleEvent = handleEvent || (p => handler.send('event', p))
      handleEvent(payload)
      break
    case 'phone_number':
      window.open('tel:' + button.payload, '_blank')
      handler.sendLinkClick(button.url)
      break
    case 'web_url':
      if (button.url.startsWith('/')) {
        document.location.href = button.url
      } else {
        window.open(button.url, '_blank')
      }
      handler.sendLinkClick(button.url)
      break
    default:
      break
  }
}

function renderButton(b, idx, handler) {
  return (
    <span className="button" key={idx} onClick={() => buttonClick(b, handler)}>
      {b.title}
    </span>
  )
}

function arrowButton(icon) {
  return <div className="arrow">{icon}</div>
}

function host(url) {
  if (!url) return null
  const parser = document.createElement('a')
  parser.href = url
  return parser.hostname
}

function renderGenericElement(element, idx, handler, message, full) {
  const defaultAction = full
    ? element.default_action
      ? () => buttonClick(element.default_action, handler)
      : null
    : () => handler.component.showModal(message, { index: idx })

  return (
    <div className="element" key={idx}>
      {element.image_url ? (
        <div onClick={defaultAction} className="image" style={{ backgroundImage: `url(${element.image_url})` }} />
      ) : null}
      {!full ? OpenModal : null}
      <div className="action-area">
        <div className="content" onClick={defaultAction}>
          <div className="title">{element.title}</div>
          {element.subtitle ? <div className="subtitle">{element.subtitle}</div> : null}
          {element.default_action && full ? <div className="url">{host(element.default_action.url)}</div> : null}
        </div>
        {element.buttons && full ? (
          <div className="template-buttons">{element.buttons.map((b, bidx) => renderButton(b, bidx, handler))}</div>
        ) : null}
      </div>
    </div>
  )
}

export default class Template extends React.Component {
  render() {
    const { handler, message, modal, modalParams } = this.props
    const { clientWidth } = handler.getClientDimensions()
    const { payload } = message

    if (payload.template_type === 'card') {
      payload.template_type = 'generic'
      payload.elements = [payload.card]
    }

    const className = `${this.props.className} ${payload.template_type}`

    switch (payload.template_type) {
      case 'button':
        return (
          <div className={className}>
            <span dangerouslySetInnerHTML={processText(payload.text)} />
            <div className="template-buttons">{payload.buttons.map((b, idx) => renderButton(b, idx, handler))}</div>
          </div>
        )

      case 'generic': {
        const singleCls = payload.elements.length === 1 ? ' single' : ''
        if (modal) {
          const settings = {
            className: 'center' + singleCls,
            centerMode: true,
            infinite: false,
            centerPadding: clientWidth > 600 ? '200px' : '40px',
            slidesToShow: 1,
            initialSlide: modalParams ? modalParams.index : 0,
            arrows: true,
            nextArrow: arrowButton(ArrowRight),
            prevArrow: arrowButton(ArrowLeft),
          }
          return (
            <Slider {...settings}>
              {payload.elements.map((element, i) => (
                <div className="slick-element" key={i}>
                  {renderGenericElement(element, i, handler, message, true)}
                </div>
              ))}
            </Slider>
          )
        }
        const full = modal || !payload.modal
        return (
          <Slider
            className={className + (full ? ' full' : '') + singleCls}
            arrows={false}
            variableWidth
            infinite={false}
          >
            {payload.elements.map((element, i) => renderGenericElement(element, i, handler, message, full))}
          </Slider>
        )
      }
      case 'list':
        return (
          <div className={className}>
            {payload.elements.map((element, i) => renderGenericElement(element, i, handler, message, true))}
            {payload.buttons.length ? (
              <div className="template-buttons">{payload.buttons.map((b, bidx) => renderButton(b, bidx, handler))}</div>
            ) : null}
          </div>
        )

      case 'input_method':
        return (
          <div className={className}>
            <InputMethodTemplate className={className} payload={payload} {...this.props} />
          </div>
        )

      default:
        return <span>Invalid template type: {payload.template_type}</span>
    }
  }
}
