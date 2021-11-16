interface Text {
  message: string
  quick_replies?: { content_type: string; title: string }[]
}

interface Location {
  lat: number
  lon: number
}

type mediaKinds = 'video' | 'audio' | 'web' | 'image'

interface Media {
  kind: mediaKinds
  url: string
  caption?: string
  preview_image?: string
  class?: string
}

interface Button {
  title: string
  type: string
  url: string
  webview_height_ration?: string
  fallback_url?: string
  webview_share_button?: string
}

interface ButtonsTemplate {
  buttons: Button[]
  template_type: 'buttons'
  text: string
}

interface TemplateElementButton {
  event: string
  payload?: string
  title: string
  type: string
}

interface TemplateDefaultAction {
  type: string
  url: string
}

interface GalleryElement {
  buttons: TemplateElementButton[]
  default_action: TemplateDefaultAction
  image_url: string
  subtitle: string
  title: string
}

interface GalleryTemplate {
  elements: GalleryElement[]
  template_type: 'gallery'
}

interface ListElement {
  default_action: TemplateDefaultAction
  image_url: string
  subtitle: string
  title: string
}

interface ListTemplate {
  button: TemplateElementButton
  elements: ListElement[]
  template_type: 'list'
}

interface Card {
  buttons: TemplateElementButton[]
  image_url: string
  subtitle: string
  title: string
}

interface CardTemplate {
  card: Card
  elements: Card[]
  template: 'gallery'
}

interface TextTemplate {
  parameters: string[]
  text: string
  template_type: 'text'
}

type Template = TextTemplate | CardTemplate | ListTemplate | GalleryTemplate | ButtonsTemplate

interface As {
  first_name?: string
  last_name?: string
  profile_picture?: string
  user_id?: string
}

interface DefaultMessageParams {
  renderable: boolean
  self: boolean
  time: number
  type: string
  delay?: string | number
  id?: string
}

type Message = {
  payload: Text & Media & Template & Location
} & DefaultMessageParams

export type TextMessage = {
  payload: Text
} & DefaultMessageParams

export type MediaMessage = {
  payload: Media
} & DefaultMessageParams

export type LocationMessage = {
  payload: Location
} & DefaultMessageParams

export type TemplateMessage = {
  payload: Template
} & DefaultMessageParams

export default Message
