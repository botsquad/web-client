import Message, { Payload } from './elements/types'

export default class API {
  _handler: ChatHandler
  _eventDispatcher: any
  constructor(handler, eventDispatcher) {
    this._handler = handler
    this._eventDispatcher = eventDispatcher
  }

  sendMessage(message: Message<Payload>) {
    return this._handler.send('message', message)
  }

  eventDispatcher() {
    return this._eventDispatcher
  }
}
