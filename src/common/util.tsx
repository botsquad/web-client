import Cookie from 'js-cookie'
import jstz from 'jstz'
import isSameYear from 'date-fns/isSameYear'
import format from 'date-fns/format'
const lang = navigator.language

const ua = navigator.userAgent

export function shortDateTimeFormat(dt: string): string {
  const m = new Date(dt)
  const now = new Date()

  if (isSameYear(m, now)) return format(m, 'd/M/yyyy')
  if (format(m, 'd MMM') !== format(now, 'd MMM')) return format(m, 'd MMM')
  return format(m, 'h:MM')
}

export function isEdge(): boolean {
  return window.navigator.userAgent.indexOf('Edge') > -1
}

export function isiOS(): boolean {
  return !!ua.match(/Mobile/) && !!ua.match(/AppleWebKit/)
}

export function isiPad(): boolean {
  return !!ua.match(/iPad/)
}

export function isiPhone(): boolean {
  return !!ua.match(/iPhone/)
}

export function isLandscape(): boolean {
  return window.innerWidth > window.innerHeight
}

export function isIE(): boolean {
  return !!window['MSInputMethodContext'] && !!document['documentMode']
}

export function isMobile(): boolean {
  if (isIE()) return false
  return document.body.clientWidth <= 480 || !!(ua.match(/Mobile/) && ua.match(/AppleWebKit/))
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

export function setCookieUserId(userId: string | undefined) {
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

export function hasCookieUserId(): boolean {
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
      browser_locale: lang.replace('-', '_'),
      user_agent: navigator.userAgent,
      web_push_capable: 'PushManager' in window,
    },
  }
}
