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
