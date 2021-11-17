export interface Text {
  message: string
  quick_replies?: { content_type: string; title: string }[]
}

export interface Location {
  lat: number
  lon: number
}

export type mediaKinds = 'video' | 'audio' | 'web' | 'image' | 'file'

export interface Media {
  kind: mediaKinds
  url: string
  caption?: string
  preview_image?: string
  class?: string
}

export interface Button {
  title: string
  type: string
  url: string
  webview_height_ration?: string
  fallback_url?: string
  webview_share_button?: string
}

export interface ButtonsTemplate {
  buttons: Button[]
  template_type: 'buttons'
  text: string
}

export interface TemplateElementButton {
  event: string
  payload?: string
  title: string
  type: string
}

export interface TemplateDefaultAction {
  type: string
  url: string
}

export interface GalleryElement {
  buttons: TemplateElementButton[]
  default_action: TemplateDefaultAction
  image_url: string
  subtitle: string
  title: string
}

export interface GalleryTemplate {
  elements: GalleryElement[]
  template_type: 'gallery'
}

export interface ListElement {
  default_action: TemplateDefaultAction
  image_url: string
  subtitle: string
  title: string
}

export interface ListTemplate {
  button: TemplateElementButton
  elements: ListElement[]
  template_type: 'list'
}

export interface Card {
  buttons: TemplateElementButton[]
  image_url: string
  subtitle: string
  title: string
}

export interface CardTemplate {
  card: Card
  elements: Card[]
  template: 'gallery'
}

export interface TextTemplate {
  parameters: string[]
  text: string
  template_type: 'text'
}

export type Template = TextTemplate | CardTemplate | ListTemplate | GalleryTemplate | ButtonsTemplate

export interface As {
  first_name?: string
  last_name?: string
  profile_picture?: string
  user_id?: string
}

export interface DefaultMessageParams {
  renderable: boolean
  self: boolean
  time: number
  type: string
  delay?: string | number
  id?: string
}

type Message<T extends Media | Text | Location | Template> = {
  payload: T
} & DefaultMessageParams

export default Message
