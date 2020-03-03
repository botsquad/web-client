import { Presence } from "phoenix"
import orderBy from 'lodash/orderBy'
import findIndex from 'lodash/findIndex'

import { setCookieUserId, getChannelParams } from '../common/util'
import { getExternalSocket } from './util'

export class OperatorsStateManager {
  constructor(component, socket, bot, config) {
    this.component = component
    this.socket = socket
    this.bot = bot
    this.config = config

    const { user_id, socket_params } = config
    const params = { ...getChannelParams(user_id), ...socket_params }

    this._channel = socket.channel('operators:' + bot.id, params)
    this._channel.join()
    this._channel.on('operators_list', ({ operators }) => {
      this._allOperators = operators
      this._channelPresence = new Presence(this._channel)
      this._channelPresence.onSync(this._syncPresence)
    })
  }

  componentWillUnmount() {
    this._channel.leave()
  }

  _syncPresence = (presence) => {
    let operators = [].concat(this._allOperators)
    let visibleOperators = [].concat(this._allOperators)

    this._channelPresence.list((g, { metas: [ first, ...rest ] }) => {
      let i = findIndex(operators, {id: first.id})
      if (i === -1) {
        operators.push(first)
      } else {
        operators[i] = first
      }
      i = findIndex(visibleOperators, {id: first.id})
      if (i >= 0) {
        visibleOperators[i] = first
      }
    })

    visibleOperators = orderBy(visibleOperators, ['status', 'profile_picture', 'name'], ['desc', 'asc', 'asc']).filter(o => o.operator_status === 'available' || o.on_call).reduce(
      (all, op) => {
        if (all.length < 4 || op.status === 'bot') {
          all.push(op)
        }
        return all
      },
      [])

    this.component.setState({ operators, visibleOperators })
  }
}
