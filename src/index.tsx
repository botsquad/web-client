import Chat from './components'
export type { ChatProps, Emit, DebugInfo, Meta } from './components'

export * as Icons from './components/icons'
export * as I18n from './common/labels'
export type I18nValue = { $i18n: true }
export type I18nArray = { [lang: string]: string[] } | I18nValue
export type { AugmentedChannel } from './components/ChatContext'

export { default as inputMethodFactory } from './components/input_method'
export { default as UploadTrigger } from './components/UploadTrigger'
export { mediaEvents } from './components/elements/Media'
export { default as NotificationManager } from './components/NotificationManager'

export * as ActionTypes from './action_types'

export default Chat
