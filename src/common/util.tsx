import moment from 'dayjs'
import Cookie from 'js-cookie'
import jstz from 'jstz'
import locale2 from 'locale2'

const ua = navigator.userAgent

export function shortDateTimeFormat(dt: string) {
  const m = moment(dt)
  const now = moment()
  if (m.year() !== now.year()) {
    return m.format('D/M/YYYY')
  }
  if (m.format('D MMM') !== now.format('D MMM')) {
    return m.format('D MMM')
  }
  return m.format('H:mm')
}

export function isEdge() {
  return window.navigator.userAgent.indexOf('Edge') > -1
}

export function isiOS() {
  return ua.match(/Mobile/) && ua.match(/AppleWebKit/)
}

export function isiPad() {
  return ua.match(/iPad/)
}

export function isiPhone() {
  return ua.match(/iPhone/)
}

export function isLandscape() {
  return window.innerWidth > window.innerHeight
}

export function isIE() {
  return !!window['MSInputMethodContext'] && !!document['documentMode']
}

export function isMobile() {
  if (isIE()) return false
  return document.body.clientWidth <= 480 || (ua.match(/Mobile/) && ua.match(/AppleWebKit/))
}

export function deviceClasses() {
  return {
    ios: isiOS(),
    iphone: isiPhone(),
    ipad: isiPad(),
    landscape: isLandscape(),
  }
}

/**
 * Simple is object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item) && item !== null
}

/**
 * Deep merge two objects.
 * @param target
 * @param source
 */
export function mergeDeep(target, source) {
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    })
  }
  return target
}

const USER_COOKIE = '_botsqd_user'

export function setCookieUserId(userId) {
  const old = Cookie.get(USER_COOKIE)
  if (old !== userId && userId !== undefined) {
    Cookie.set(USER_COOKIE, userId, { expires: 365 * 10 })
  }
}

export function getCookieUserId() {
  let userId = Cookie.get(USER_COOKIE)
  if (!userId || !userId.length) {
    userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setCookieUserId(userId)
  }
  return userId
}

export function hasCookieUserId() {
  return !!Cookie.get(USER_COOKIE)
}

export function removeCookieUserId() {
  Cookie.remove(USER_COOKIE)
}

export function updateQueryStringParam(key, value) {
  const baseUrl = [location.protocol, '//', location.host, location.pathname].join('')
  const urlQueryString = document.location.search
  const newParam = key + '=' + value
  let params = ''

  // If the "search" string exists, then build params from it
  if (urlQueryString) {
    const updateRegex = new RegExp('([?&])' + key + '[^&]*')
    const removeRegex = new RegExp('([?&])' + key + '=[^&;]+[&;]?')

    if (typeof value === 'undefined' || value === null || value === '') {
      // Remove param if value is empty
      params = urlQueryString.replace(removeRegex, '$1')
      params = params.replace(/[&;]$/, '')
    } else if (urlQueryString.match(updateRegex) !== null) {
      // If param exists already, update it
      params = urlQueryString.replace(updateRegex, '$1' + newParam)
    } else {
      // Otherwise, add it to end of query string
      params = urlQueryString + '&' + newParam
    }
  } else if (value) {
    params = '?' + newParam
  }
  window.history.replaceState({}, '', baseUrl + params + document.location.hash)
}

function getUrlParameter(name) {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

export function getChannelParams(defaultId) {
  const params = { delegate_token: undefined, user_id: undefined }

  const delegate_token = getUrlParameter('u')
  if (delegate_token) {
    params.delegate_token = delegate_token
  }
  params.user_id = defaultId || getCookieUserId()

  return params
}

export function consumeChannelParams() {
  updateQueryStringParam('u', null)
  updateQueryStringParam('e', null)
}

export function getUserInfo() {
  const timezone = jstz.determine()
  return {
    timezone: timezone.name(),
    extra: {
      browser_locale: locale2.replace('-', '_'),
      user_agent: navigator.userAgent,
      web_push_capable: 'PushManager' in window,
    },
  }
}

export function parseUrl(url: string) {
  const parser = document.createElement('a')
  parser.href = url
  return parser
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

export function setupSocketReconnectBehaviour(socket, channel, notificationManager) {
  if (socket.__connect) return

  let connected = !!socket.conn

  socket.onOpen(() => {
    connected = true
  })

  socket.onClose(() => {
    connected = false
    socket.params = { ...socket.params, reconnect: true }
  })

  socket.__connect = socket.connect

  socket.connect = () => {
    if (!notificationManager.isHidden()) {
      socket.__connect()
    }
  }

  channel.__push = channel.push
  channel.push = (event, payload) => {
    if (!connected) {
      socket.__connect()
    }
    return channel.__push(event, payload)
  }
}

export function getQueryParams() {
  return document.location.search
    .replace(/(^\?)/, '')
    .split('&')
    .map(
      function (n) {
        return (n = n.split('=')), (this[n[0]] = n[1]), this
      }.bind({}),
    )[0]
}

export function hostCheck(domains: any[]) {
  const { hostname } = document.location
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '127.0.0.1' ||
    hostname === 'bsqd.me' ||
    hostname.endsWith('.bsqd.me')
  ) {
    return true
  }
  if (!domains || !domains.length) return false
  if (domains.indexOf(hostname) >= 0 || domains.find(h => hostname.endsWith('.' + h))) {
    return true
  }

  // eslint-disable-next-line no-console
  console.log(`💡 [Botsquad] This chat widget is not configured to be hosted on ${hostname}.`)

  return false
}

export function newGroup() {
  return Math.random().toString(36).substring(2, 10)
}
