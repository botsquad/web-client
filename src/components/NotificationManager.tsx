import { Channel } from 'phoenix'
import React from 'react'

const NUMBERS = ['❶', '❷', '❸', '❹', '❺', '❻', '❼', '❽', '❾', '❿']
const SOUND = 'https://s3.eu-central-1.amazonaws.com/bsqd/audio/df56cb16-124c-4975-8a86-bbdd0dd20102.dat'
const NOTIFICATION_CLEAR_TIME = 5000

interface NotificationManagerProps {
  component: any
}

export default class NotificationManager extends React.Component<NotificationManagerProps> {
  component: any //React.Component & { handler?: { channel?: Channel },props:{host:any,externalInterface:any} }
  hasCordovaFocus: boolean | null
  _onFocusHandlers: (() => void)[]
  channel: Channel
  documentTitle: string
  sound: HTMLElement | HTMLAudioElement | null
  _hidden: boolean
  clearer: ReturnType<typeof setTimeout> | null
  hasFocus: boolean

  constructor(component: React.Component) {
    super({ component })
    this.component = component
    this.hasCordovaFocus = null
    this._onFocusHandlers = []
  }

  setChannel(channel: Channel) {
    this.channel = channel
  }

  _push(event: string, payload: object) {
    const channel = this.channel || (this.component.handler && this.component.handler.channel)
    if (channel) {
      channel.push(event, payload)
    }
  }

  componentDidMount() {
    this.documentTitle = document.title
    window.addEventListener('focus', this.windowFocusChange.bind(this))
    window.addEventListener('blur', this.windowFocusChange.bind(this))
    document.addEventListener('pause', this.cordovaFocusChange.bind(this, false), false)
    document.addEventListener('resume', this.cordovaFocusChange.bind(this, true), false)
  }

  componentWillUnmount() {
    this._clearNotificationUI()
    window.removeEventListener('focus', this.windowFocusChange.bind(this))
    window.removeEventListener('blur', this.windowFocusChange.bind(this))
    document.removeEventListener('pause', this.cordovaFocusChange.bind(this, false), false)
    document.removeEventListener('resume', this.cordovaFocusChange.bind(this, true), false)
  }

  play() {
    if (this.mayPlaySound()) {
      try {
        this.sound = document.getElementById('botsquad-notification-audio')
        if (!this.sound) {
          let sound = document.createElement('audio')
          sound.setAttribute('id', 'botsquad-notification-audio')
          sound.onload = () => sound.play()
          sound.src = SOUND
          document.body.appendChild(sound)
        } else {
          ;(this.sound as HTMLAudioElement).play()
        }
      } catch (e) {
        // autoplay audio is disabled
      }
    }
  }

  onFocus(callback: () => void) {
    if (!this.isHidden()) {
      callback()
    } else {
      this._onFocusHandlers.push(callback)
    }
  }

  cordovaFocusChange(flag: boolean) {
    this.hasCordovaFocus = flag
    this.windowFocusChange()
  }

  windowFocusChange() {
    setTimeout(() => {
      if (this._hidden !== this.isHidden()) {
        this._performWindowFocusChange()
        this._hidden = this.isHidden()
        if (!this.isHidden()) {
          this._onFocusHandlers.forEach(callback => callback())
          this._onFocusHandlers = []
        }
      }
    }, 0)
  }

  _performWindowFocusChange() {
    if (!this.isHidden()) {
      this.clearer = setTimeout(() => {
        this.clearer = null
        this.clearNotifications()
      }, NOTIFICATION_CLEAR_TIME)
    } else if (!this.hasFocus && this.clearer) {
      clearTimeout(this.clearer)
      this.clearer = null
    }

    this._push('set_presence', { away: this.isHidden() })
  }

  notifyMessageCount(messageCount: number) {
    if (messageCount > 0) {
      if (this.isHidden()) {
        this.play()
      }
      const n = NUMBERS[messageCount - 1] || `(${messageCount})`
      document.title = `${n} ${this.documentTitle}`
    } else {
      this._clearNotificationUI()
    }
  }

  clearNotifications() {
    this._push('set_conversation_read', {})
    this._clearNotificationUI()
  }

  _clearNotificationUI() {
    document.title = this.documentTitle
  }

  isHidden() {
    if (this.hasCordovaFocus !== null) {
      return !this.hasCordovaFocus
    }
    return !document.hasFocus()
  }

  mayPlaySound() {
    return (
      (this.component.props.host && this.component.props.host.mayPlaySound()) ||
      (this.component.externalInterface && this.component.externalInterface.mayPlaySound())
    )
  }
}
