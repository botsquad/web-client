import React from 'react'
import Slider from 'react-slick'
import _ from 'lodash'

import InputMethodTemplate from './InputMethodTemplate'
import { OpenModal, ArrowLeft, ArrowRight } from '../icons'
import { TextUtil } from '@botsquad/sdk'
import './css/slick.min.css'
import Message, {
  ButtonsTemplate,
  GalleryTemplate,
  InputTemplate,
  ListTemplate,
  Template as TemplateType,
  TextTemplate,
  GalleryElement,
  ListElement,
  TemplateElementButton,
} from './types'
export function buttonClick(button: TemplateElementButton, handler: any, handleEvent: any) {
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

function renderButton(b: TemplateElementButton, idx: number, handler: any) {
  return (
    <span className="button" key={idx} onClick={() => buttonClick(b, handler, null)}>
      {b.title}
    </span>
  )
}

function arrowButton(icon: React.ReactNode) {
  return <div className="arrow">{icon}</div>
}

function host(url: string) {
  if (!url) return null
  const parser = document.createElement('a')
  parser.href = url
  return parser.hostname
}

function renderGalleryElement(
  element: GalleryElement | ListElement,
  idx: number,
  handler: any,
  message: Message<TemplateType>,
  full: boolean,
) {
  const defaultAction = full
    ? element.default_action
      ? () => buttonClick(element.default_action, handler, null)
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
        {'buttons' in element && full ? (
          <div className="template-buttons">{element.buttons.map((b, bidx) => renderButton(b, bidx, handler))}</div>
        ) : null}
      </div>
    </div>
  )
}

interface Props {
  handler: any //{ getClientDimensions(): { clientWidth: number }, component:{showModal:function} }
  message: Message<TemplateType>
  modal: any //Probably react Element
  modalParams?: { index?: number }
  className: string
}

const Template: React.FC<Props> = ({ handler, message, modal, modalParams, className: classes }) => {
  const { clientWidth } = handler.getClientDimensions()
  const { payload } = message
  const props = { handler, message, modal, modalParams, classes }

  //Adding the template type to the class names, except if it is a card then it becomes a gallery (cards are one element galleries)
  const className = `${classes} + ${payload.template_type === 'card' ? 'gallery' : payload.template_type}`

  const RenderTextTemplate = (payload: TextTemplate) => {
    if (typeof payload.text !== 'string') return null
    const innerHTML = TextUtil.processTemplate(TextUtil.processText(payload.text), payload.parameters || {})
    return (
      <div className={className}>
        {/* Casting innerHTML as it returns, in this case {__html:string} */}
        <span dangerouslySetInnerHTML={innerHTML as { __html: string }} />
      </div>
    )
  }

  const RenderButtonsTemplate = (payload: ButtonsTemplate) => (
    <div className={className}>
      <span dangerouslySetInnerHTML={TextUtil.processText(payload.text)} />
      <div className="template-buttons">{payload.buttons.map((b, idx) => renderButton(b, idx, handler))}</div>
    </div>
  )

  const RenderListTemplate = (payload: ListTemplate) => (
    <div className={className}>
      {payload.elements.map((element, i) => renderGalleryElement(element, i, handler, message, true))}
      {payload.button ? <div className="template-buttons">{renderButton(payload.button, 0, handler)}</div> : null}
    </div>
  )

  const RenderGalleryTemplate = (payload: GalleryTemplate) => {
    // This is for the case that gallery is a card
    const singleClass = payload.elements.length === 1 ? ' single' : ''
    if (modal) {
      const settings = {
        className: 'center' + singleClass,
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
              {renderGalleryElement(element, i, handler, message, true)}
            </div>
          ))}
        </Slider>
      )
    }
    return (
      <Slider className={className + singleClass} arrows={false} variableWidth infinite={false}>
        {payload.elements.map((element, i) => renderGalleryElement(element, i, handler, message, false))}
      </Slider>
    )
  }

  const RenderInputMethodTemplate = (payload: InputTemplate) => (
    <div className={className}>
      <InputMethodTemplate className={className} payload={payload} {...props} />
    </div>
  )
  const template_type = payload.template_type
  switch (template_type) {
    case 'text':
      return RenderTextTemplate(payload as TextTemplate)
    case 'button': // This is for backwards-compatibility
    case 'buttons':
      return RenderButtonsTemplate(payload as ButtonsTemplate)
    case 'list':
      return RenderListTemplate(payload as ListTemplate)
    case 'card':
      // A card is a Gallery of one element!
      const galleryPayloadFromCard: GalleryTemplate = { elements: [payload.card], template_type: 'gallery' }
      return RenderGalleryTemplate(galleryPayloadFromCard)
    case 'generic':
    case 'gallery':
      return RenderGalleryTemplate(payload as GalleryTemplate)
    case 'input_method':
      return RenderInputMethodTemplate(payload as InputTemplate)
    default:
      // Technically shouldn't exist But If it does this is an error message
      return <span>Invalid template type: {template_type}</span>
  }
}

export default Template
