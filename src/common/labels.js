import locale2 from 'locale2'

const LABELS = {
  location_picker_select: {
    $i18n: true,
    en: 'Choose location',
    nl: 'Kies locatie',
    de: 'Wählen Sie einen Ort',
    fr: "Choisissez l'emplacement",
    es: 'Elegir ubicación',
    da: 'Vælg placering',
    ar: 'اختيار موقع',
  },
  form_submit_button: {
    $i18n: true,
    en: 'Submit',
    nl: 'Verstuur',
    de: 'Senden',
    fr: 'Enregistrer',
    es: 'Guardar',
    da: 'Indsend',
    ar: 'إرسال',
  },
  cancel: {
    $i18n: true,
    en: 'Cancel',
    nl: 'Annuleren',
    de: 'Abbrechen',
    fr: 'Annuler',
    es: 'Cancelar',
    da: 'Afbestille',
    ar: 'إلغاء',
  },
  text_input_placeholder: {
    $i18n: true,
    en: 'Type a message…',
    nl: 'Typ een bericht…',
    de: 'Nachricht schreiben…',
    fr: 'Tapez le message…',
    es: 'Escriba mensaje…',
    da: 'Skriv en besked…',
    ar: 'اكتب رسالة ...',
  },
  new_conversation: {
    $i18n: true,
    en: 'New conversation',
    nl: 'Nieuw gesprek',
    de: 'Neues Gespräch',
    fr: 'Nouvelle conversation',
    es: 'Nueva conversacion',
    da: 'Ny samtale',
    ar: 'محادثة جديدة',
  },
}

let _uiLocale = null

export function determineUILocale(initialLocale, bot) {
  const { locale } = bot
  const extra_locales = bot.extra_locales || bot.extraLocales
  const user = initialLocale || locale2.replace(/-.*$/, '')
  if (user === locale || extra_locales.indexOf(user) >= 0) {
    _uiLocale = user
  } else {
    _uiLocale = locale
  }
  if (typeof LABELS[_uiLocale] === 'undefined') {
    _uiLocale = 'en'
  }
  return _uiLocale
}

export function localePreflist(userLocale, bot) {
  const prefList = [bot.locale].concat(bot.extra_locales)
  if (prefList.indexOf(userLocale) >= 0) {
    prefList.unshift(userLocale)
  }
  return prefList
}

export function resolveTranslationsLocales(value, locales) {
  if (typeof value !== 'object') {
    return value
  }

  if (value === null) {
    return null
  }

  if (Array.isArray(value)) {
    return value.map(v => resolveTranslations(v, locales))
  }
  // regular object
  if (value.$i18n === true) {
    // this is a translation object
    return (
      (locales || ['en']).reduce((translated, lang) => translated || value[lang], null) ||
      value[Object.keys(value).filter(k => k.match(/^[a-z]/))[0]]
    )
  }

  Object.keys(value).forEach(k => {
    value[k] = resolveTranslations(value[k], locales)
  })
  return value
}

export function resolveTranslations(value, userLocale, bot) {
  if (typeof value !== 'object') {
    return value
  }

  if (!bot) {
    // userLocale is a list
    return resolveTranslationsLocales(value, userLocale)
  }

  return resolveTranslationsLocales(value, localePreflist(userLocale, bot))
}

export function fixedLabel(key, prefList) {
  return resolveTranslations(LABELS[key], prefList.concat(['en']))
}

export function chatLabel(component, part) {
  const { ui_labels } = component.props.settings
  return (
    (ui_labels && resolveTranslationsLocales(ui_labels[part], component.props.localePrefs)) ||
    fixedLabel(part, component.props.localePrefs)
  )
}

export function textDirectionClass(locale) {
  if (locale.startsWith('ar') || locale.startsWith('he')) {
    return 'rtl'
  }

  return 'ltr'
}
