import React from 'react'
import { Socket, Channel } from 'phoenix'

declare module '@botsquad/web-client' {
  export function processText(input: string): { __html: any }

  export function processTemplate(input: string, parameters: Record<string, string>): string

  export const I18n = {
    resolveTranslations: (input: any, locales: string[]) => any,
    localePreflist: (locale: string, bot: any) => string[]
  }

  export type I18nValue = { $i18n: true }
  export type I18nArray = { [lang: string]: string[] } | I18nValue

  export class NotificationManager {
    constructor(component: React.Component)
    componentDidMount(): void
    setChannel(channel: Channel): void
    sendChatOpenState(): void
    onFocus(): void
    notifyMessageCount(count: number): void
    isHidden(): boolean
    play(): void
    closeConversation(g: string): void
  }

  export type Emit = { event: string; payload?: any }

  export type ChatProps = {
    bot_id: string
    socket?: Socket
    params?: Record<string, any>
    onHideInput?: (flag: boolean) => void
    settings?: Record<string, any>
    localePrefs?: string[]
    closeConversation?: () => void
    mapsApiKey?: string
    botAvatar?: string
    userAvatar?: string
    onChannel?: (channel: Channel) => void
    onChannelLeave?: () => void
    onClose?: () => void
    onEmit?: (event: Emit) => void
    notificationManager?: boolean
    online?: boolean
    hideAvatars?: boolean
    onJoinError?: (payload: { reason: string }) => void
    onError?: (message: string) => void
    onDebug?: (info: DebugInfo) => void
    makeChannelTopic?: (botId: string, params: Record<string, any>) => string | null
  }

  type BotProcesses = {
    master?: true
    group?: string
  }

  export type Meta = {
    readonly dialog?: string | null
    readonly file?: string | null
    readonly line?: string | number
  }

  export type DebugInfo = {
    meta: Meta | null
    context: Record<string, string> | null
    processes: BotProcesses
  }

  export default class Chat extends React.Component<ChatProps> {
    props: ChatProps
  }

  export class UploadTrigger extends React.Component {
    callback: () => void
    state: {
      accept: string
    }
    onChange: (e: React.ChangeEvent) => void
    trigger: (accept: string, callback: (file: any) => void) => void

    render: () => React.ReactNode
  }

  export function inputMethodFactory(method: {type: any, payload: any, time?: any}, props: any, inputModal: any) => React.ReactNode
}
