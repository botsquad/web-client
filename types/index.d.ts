import React from 'react'
import { Channel } from 'phoenix'

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
}
