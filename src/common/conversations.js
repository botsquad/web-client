import React from 'react'
import classNames from 'classnames'
import { Presence } from "phoenix"
import orderBy from 'lodash/orderBy'

import { setCookieUserId, getUserInfo, getChannelParams } from '../common/util'
import { getExternalSocket } from './util'

export function conversationTitle({ operator, subject }, bot, extraTitle) {
  const operatorName = operator ? `${operator.first_name} ${operator.last_name}`.trim() : null
  return subject || operatorName || extraTitle || bot.title
}

export function conversationAvatar({ operator, subject }, bot, operators) {
  if (!bot?.profile_picture) {
    return null
  }

  const avatar = subject ? bot.profile_picture : (operator?.profile_picture || bot.profile_picture)
  let inner = null

  if (operator && !subject) {
    const presence = operators.find(o => o.id === operator.id)
    if (presence?.status) {
      inner = <div className={classNames('dot', presence.status)} />
    }
  }
  return <div className="avatar" style={{ backgroundImage: `url(${avatar})` }}>{inner}</div>
}

export class ConversationsStateManager {
  constructor(component, socket, bot, config, notificationManager) {
    this.component = component
    this.socket = socket
    this.bot = bot
    this.config = config
    this.notificationManager = notificationManager

    const { user_id, socket_params } = config
    const user = getUserInfo()
    const params = { ...getChannelParams(user_id), context: { user }, ...socket_params }

    this._channel = socket.channel('conversations:' + bot.id, params)
    this._channel.join().receive('ok', ({ user_id, user }) => {
      this._channelPresence = new Presence(this._channel)
      this._channelPresence.onSync(this._syncPresence)
      setCookieUserId(user_id)
      if (user?.locale) {
        this.component.setState({ locale: user.locale })
      }
    })
  }

  componentWillUnmount() {
    this._channel.leave()
    this._channel = null
  }

  closeConversation = (g) => {
    return new Promise((resolve) => {
      this._channel.push('bury_conversation', { g })
          .receive('ok', () => {
            this._syncPresence()
            resolve()
          })
    })
  }

  _retrieveConversations() {
    return new Promise((resolve) => {
      this._channel.push('list_conversations', {}).receive('ok', ({ conversations }) => {
        resolve(conversations)
      })
    })
  }

  _syncPresence = (presence) => {
    this._retrieveConversations().then(dbConv => {

      let conversations = []
      let seen = {}
      this._channelPresence.list((g, { metas: [ first, ...rest ] }) => {
        seen[g] = true
        conversations.push(first)
      })
      for (let conv of dbConv) {
        if (!seen[conv.g]) {
          conversations.push(conv)
        }
      }

      conversations = orderBy(conversations, 'last_message_date', 'desc')
      this.component.setState({ conversations })

      if (conversations.length && conversations[0].locale) {
        this.component.setState({ locale: conversations[0].locale })
      }

      const unreadMessageCount = conversations.reduce((total, conv) => total + conv.unread_message_count, 0)
      if (this.notificationManager) {
        this.notificationManager.notifyMessageCount(unreadMessageCount)
      }

    })
  }

}
