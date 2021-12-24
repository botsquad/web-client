import Chat from 'components'
import { Channel, Socket } from 'phoenix'
import { setCookieUserId } from '../common/util'

export default function botChatHandler(
  component: Chat,
  socket: Socket,
  bot_id: string,
  params: Record<string, string>,
) {
  if (!socket) {
    return null
  }

  const defaultTopic = `bot:${bot_id}~${params.g || 'main'}`
  const topic = component.props.makeChannelTopic?.(bot_id, params) || defaultTopic

  const channel: Channel & { hasMoreHistory?: any; getMoreHistory?: any } = socket.channel(topic, params)

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

        if (component.props.onChannel) {
          if (!component.mounted) return
          component.props.onChannel(channel)
        }

        channel.on('history', ({ events, next }) => {
          component.setState({ joined: true })
          if (!component.mounted || gotFirstHistory) return
          historyNext = next || null
          const history = events.reverse().map(({ time, ...rest }: any) => ({ ...rest, time: Date.parse(time) }))
          gotFirstHistory = true
          component.prependEvents(history, component.props.onReady, true)
        })
        channel.on('typing', ({ payload, as }) => {
          if (!component.mounted) return
          component.setState({ typing: payload, typingAs: as })
        })
        channel.on('message', event => {
          if (!component.mounted) return
          if (event.payload?.input_method === 'closed' && component.props.onHideInput) {
            component.props.onHideInput(event.payload)
          }
          component.setState({ online: true })
          component.addEvent({ ...event, time: new Date().getTime() })
        })
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
          if (event.event === 'hide_input' && component.props.onHideInput) {
            component.props.onHideInput(event.payload)
          }
          if (component.props.onEmit) {
            component.props.onEmit(event)
          }
        })
        channel.on('conversation_meta', conversationMeta => {
          component.setState({ conversationMeta })
          if (component.props.onConversationMeta) {
            component.props.onConversationMeta(conversationMeta)
          }
        })
        channel.on('error', error => {
          if (!component.mounted) return
          if (component.props.onError) {
            component.props.onError(error)
          }
        })
        channel.on('debug_info', info => {
          if (!component.mounted) return
          if (component.props.onDebug) {
            component.props.onDebug(info)
          }
        })
        channel.onClose(() => {
          if (!component.mounted) return
          if (component.props.onClose) {
            component.props.onClose()
          }
        })

        resolve(channel)
      })
  })
}
