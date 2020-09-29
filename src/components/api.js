export default class API {
  constructor(handler, eventDispatcher) {
    this._handler = handler
    this._eventDispatcher = eventDispatcher
  }

  sendMessage(message) {
    return this._handler.send('message', message)
  }

  eventDispatcher() {
    return this._eventDispatcher
  }
}
