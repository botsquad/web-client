import Chat from 'components'
import { Channel, Socket } from 'phoenix'
import { setCookieUserId } from '../common/util'
import { AugmentedChannel } from './ChatContext'

export default function botChatHandler(
  component: Chat,
  socket: Socket,
  params: Record<string, string>,
  span: () => object
): Promise<AugmentedChannel | undefined> {
  if (!socket) {
    return Promise.resolve(undefined)
  }

  const { bot_id, operatorConversationId, onEmit, onReady, onChannel, onConversationMeta, onError, onDebug, onClose } =
    component.props

  const botTopic = `bot:${bot_id}~${params.g || 'main'}`
  const topic = operatorConversationId ? `conversation:${operatorConversationId}` : botTopic

  const channel: Channel & { hasMoreHistory?: any; getMoreHistory?: any } = socket.channel(topic, () => {
    return {
      ...params,
      span: span(),
    }
  })

  let joined = false
  setTimeout(() => {
    if (component.state.joined === null) {
      component.setState({ joined: false })
    }
  }, 400)

  return new Promise((resolve, reject) => {
    channel
      .join()
      .receive('error', resp => {
        reject(resp)
      })
      .receive('ok', joinResult => {
        if (joined) {
          return
        }
        joined = true

        let historyNext: any = null
        let gotFirstHistory = false

        // retrieve more
        channel.hasMoreHistory = () => historyNext !== null
        channel.getMoreHistory = () => {
          if (historyNext === null) {
            return
          }
          channel.push('get_history', { next: historyNext }).receive('ok', ({ events, next }) => {
            historyNext = next
            const history = events.reverse().map(({ time, ...rest }: any) => ({ ...rest, time: Date.parse(time) }))
            component.prependEvents(history, undefined, false)
          })
        }

        if (params.user_id && joinResult.user_id && params.user_id !== joinResult.user_id) {
          setCookieUserId(joinResult.user_id)
        }

        if (onChannel) {
          if (!component.mounted) return
          onChannel(channel as AugmentedChannel)
        }

        channel.on('history', ({ events, next }) => {
          component.setState({ joined: true })
          if (!component.mounted || gotFirstHistory) return
          historyNext = next || null
          const history = events.reverse().map(({ time, ...rest }: any) => ({ ...rest, time: Date.parse(time) }))
          gotFirstHistory = true
          component.prependEvents(history, onReady, true)
        })
        channel.on('future', ({ events }) => {
          component.setState({ joined: true })
          if (!component.mounted) return
          for (const event of events) {
            component.addEvent({ ...event, time: Date.parse(event.time) })
          }
        })
        channel.on('typing', ({ payload, as }) => {
          if (!component.mounted) return
          component.setState({ typing: payload, typingAs: as })
        })

        const messageHandler = (event: any) => {
          if (!component.mounted) return
          if (event.payload?.input_method === 'closed') {
            component.setState({ hideInput: true })
          }
          component.setState({ online: true })
          component.addEvent({ ...event, time: new Date().getTime() })
        }
        channel.on('message', messageHandler)
        channel.on('conversation_action', messageHandler)

        channel.on('input_method', payload => {
          if (!component.mounted) return
          component.addEvent({ type: 'input_method', payload })
          // sometimes the input method modal is not yet updated
          setTimeout(() => component.forceUpdate(), 0)
        })
        channel.on('emit', event => {
          if (!component.mounted) return
          if (event.event === 'trigger_modal') {
            component.triggerModal()
          }
          if (event.event === 'hide_modal') {
            component.hideModal()
          }
          if (event.event === 'toast') {
            component.showToast(event.payload)
          }
          if (event.event === 'trigger_audio') {
            component.triggerAudio(event.payload)
          }
          if (event.event === 'hide_input') {
            component.setState({ hideInput: event.payload })
          }
          onEmit?.(event)
        })
        channel.on('conversation_meta', conversationMeta => {
          component.setState({ conversationMeta })
          onConversationMeta?.(conversationMeta)
        })
        channel.on('error', error => {
          if (!component.mounted) return
          onError?.(error)
        })
        channel.on('debug_info', info => {
          if (!component.mounted) return
          onDebug?.(info)
        })
        channel.on('invalid_file', ({ url }) => {
          component.removeFile(url)
        })
        channel.onClose(() => {
          if (!component.mounted) return
          onClose?.()
        })

        resolve(channel as AugmentedChannel)
      })
  })
}
