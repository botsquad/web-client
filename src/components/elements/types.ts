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
  class: string
  caption?: string
  preview_image?: string
}

export interface TemplateElementButton {
  event: string
  payload: string
  title: string
  type: string
  json?: string
  hide_modal?: boolean
  url?: string
}

export interface ButtonsTemplate {
  buttons: TemplateElementButton[]
  template_type: 'buttons' | 'button'
  text: string
  default_action?: TemplateElementButton
}

export interface GalleryElement {
  buttons: TemplateElementButton[]
  default_action?: TemplateElementButton
  image_url: string
  subtitle: string
  title: string
}

export interface GalleryTemplate {
  elements: GalleryElement[]
  template_type: 'gallery' | 'generic'
}

export interface ListElement {
  default_action?: TemplateElementButton
  image_url: string
  subtitle: string
  title: string
}

export interface ListTemplate {
  button: TemplateElementButton
  elements: ListElement[]
  template_type: 'list'
}

// Card Is Basically a gallery with one Gallery element (the Card)
export interface CardTemplate {
  card: GalleryElement
  elements: GalleryElement[]
  template_type: 'card'
}

export interface TextTemplate {
  parameters: { [key: string]: string }
  text: string
  template_type: 'text'
}

export interface InputTemplate {
  data: any
  template_id: string
  type: string
  template_type: 'input_method'
}

export type Template = TextTemplate | CardTemplate | ListTemplate | GalleryTemplate | ButtonsTemplate | InputTemplate

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

function isTextTemplate(someVar: Template): someVar is TextTemplate {
  return someVar.template_type === 'text'
}
function isCardTemplate(someVar: Template): someVar is CardTemplate {
  return someVar.template_type === 'card'
}
function isGalleryTemplate(someVar: Template): someVar is GalleryTemplate {
  return someVar.template_type === 'gallery' || someVar.template_type === 'generic'
}
function isListTemplate(someVar: Template): someVar is ListTemplate {
  return someVar.template_type === 'list'
}
function isButtonsTemplate(someVar: Template): someVar is ListTemplate {
  return someVar.template_type === 'buttons' || someVar.template_type === 'button'
}
