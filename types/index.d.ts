import React from 'react'
import { Socket, Channel } from 'phoenix'

declare module '@botsquad/web-client' {
  export function processText(input: string): { __html: any }

  export const I18n = {
    resolveTranslations: (input: any, locales: string[]) => any,
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
  }

  export default class Chat extends React.Component<ChatProps> {
    props: ChatProps
  }
}
