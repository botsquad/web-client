const lang = navigator.language

const LABELS = {
  image_picker_select: {
    $i18n: true,
    en: 'Choose image',
    nl: 'Kies afbeelding',
    de: 'Bild auswählen',
    fr: "Choisissez l'image",
    es: 'Elegir imagen',
    da: 'Vælg billede',
    fi: 'Valitse kuva',
  },
  audio_picker_select: {
    $i18n: true,
    en: 'Choose audio file',
    nl: 'Kies geluidsbestand',
    de: 'Ton auswählen',
    fr: 'Choisissez le son',
    es: 'Elige el sonido',
    da: 'Vælg lydfil',
    fi: 'Valitse äänitiedosto',
  },
  video_picker_select: {
    $i18n: true,
    en: 'Choose video',
    nl: 'Kies video',
    de: 'Video auswählen',
    fr: 'Choisissez la vidéo',
    es: 'Elige video',
    da: 'Vælg video',
    fi: 'Valitse video',
  },
  file_picker_select: {
    $i18n: true,
    en: 'Choose file',
    nl: 'Kies bestand',
    de: 'Datei wählen',
    fr: 'Choisir le fichier',
    es: 'Elija el archivo',
    da: 'Vælg fil',
    fi: 'Valitse tiedosto',
  },
  location_picker_select: {
    $i18n: true,
    en: 'Choose location',
    nl: 'Kies locatie',
    de: 'Wählen Sie einen Ort',
    fr: "Choisissez l'emplacement",
    es: 'Elegir ubicación',
    da: 'Vælg placering',
    fi: 'Valitse sijainti',
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
    fi: 'Lähetä',
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
    fi: 'Peruuttaa',
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
    fi: 'Kirjoita viesti…',
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
    fi: 'Uusi keskustelu',
    ar: 'محادثة جديدة',
  },
  invalid_iban: {
    $i18n: true,
    en: 'IBAN is invalid',
    nl: 'IBAN is ongeldig',
    de: 'IBAN ist ungültig',
    fr: "L'IBAN est invalide",
    es: 'IBAN no es válido',
    da: 'IBAN er ugyldigt',
    fi: 'IBAN on virheellinen',
    ar: 'رقم الحساب المصرفي الدولي (IBAN) غير صالح',
  },
}

let _uiLocale: string | null = null

export function determineUILocale(initialLocale: string, bot: any) {
  const { locale } = bot
  const extra_locales = bot.extra_locales || bot.extraLocales
  const user = initialLocale || lang.replace(/-.*$/, '')
  if (user === locale || extra_locales.indexOf(user) >= 0) {
    _uiLocale = user
  } else {
    _uiLocale = locale
  }
  if (!_uiLocale || typeof LABELS.cancel[_uiLocale] === 'undefined') {
    _uiLocale = 'en'
  }
  return _uiLocale
}

export function localePreflist(userLocale: string | string[], bot: any) {
  const prefList = [bot.locale].concat(bot.extra_locales)
  if (prefList.indexOf(userLocale) >= 0) {
    prefList.unshift(userLocale)
  }
  return prefList
}

export function resolveTranslations(value: any, userLocale: string | string[], bot: any): any {
  if (typeof value !== 'object') {
    return value
  }

  if (!bot) {
    // userLocale is a list
    return resolveTranslationsLocales(value, userLocale)
  }

  return resolveTranslationsLocales(value, localePreflist(userLocale, bot))
}

export function resolveTranslationsLocales(value: any, locales: any): any {
  if (typeof value !== 'object') {
    return value
  }

  if (value === null) {
    return null
  }

  if (Array.isArray(value)) {
    return value.map(v => resolveTranslations(v, locales, null))
  }
  // regular object
  if (value.$i18n === true) {
    // this is a translation object
    return (
      (locales || ['en']).reduce((translated: string, lang: string) => translated || value[lang], null) ||
      value[Object.keys(value).filter(k => k.match(/^[a-z]/))[0]]
    )
  }

  Object.keys(value).forEach(k => {
    value[k] = resolveTranslations(value[k], locales, null)
  })
  return value
}

export function fixedLabel(key: keyof typeof LABELS, prefList: string[]) {
  return resolveTranslations(LABELS[key], prefList.concat(['en']), null)
}

export function chatLabel(settings: { ui_labels: any[] } | null, localePrefs: string[], part: any) {
  if (settings) {
    const { ui_labels } = settings
    return (ui_labels && resolveTranslationsLocales(ui_labels[part], localePrefs)) || fixedLabel(part, localePrefs)
  }
}

export function textDirectionClass(locale: string) {
  if (locale.startsWith('ar') || locale.startsWith('he')) {
    return 'rtl'
  }

  return 'ltr'
}
