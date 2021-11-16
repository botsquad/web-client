interface TextPayload {
  message: string
  quick_replies?: { content_type: string; title: string }[]
}

interface LocationPayload {
  lat: number
  lon: number
}

type mediaKinds = 'video' | 'audio' | 'web'

interface Media {
  kind: string
  url: string
  caption?: string
  preview_image?: string
  class?: string
}

interface ButtonsTemplate {
  title: string
  type: string
  url: string
  webview_height_ration?: string
  fallback_url?: string
  webview_share_button?: string
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
  template_type: 'text'
  text: string
}

type Template = TextTemplate | CardTemplate | ListTemplate | GalleryTemplate | ButtonsTemplate

interface As {
  first_name?: string
  last_name?: string
  profile_picture?: string
  user_id?: string
}

interface Message {
  payload: Text | Media | Template
  renderable: boolean
  self: boolean
  time: number
  type: string
  delay?: string | number
  id?: string
}
