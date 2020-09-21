export default class API {
  constructor(handler) {
    this._handler = handler
  }

  sendMessage(message) {
    return this._handler.send('message', message)
  }
}
