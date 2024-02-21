const lang = navigator.language

const LABELS = {
  image_picker_select: {
    $i18n: true,
    da: 'Vælg billede',
    de: 'Bild auswählen',
    en: 'Choose image',
    es: 'Elegir imagen',
    fi: 'Valitse kuva',
    fr: "Choisissez l'image",
    nl: 'Kies afbeelding',
    sv: 'Välj bild',
  },
  audio_picker_select: {
    $i18n: true,
    da: 'Vælg lydfil',
    de: 'Ton auswählen',
    en: 'Choose audio file',
    es: 'Elige el sonido',
    fi: 'Valitse äänitiedosto',
    fr: 'Choisissez le son',
    nl: 'Kies geluidsbestand',
    sv: 'Välj ljudfil',
  },
  video_picker_select: {
    $i18n: true,
    da: 'Vælg video',
    de: 'Video auswählen',
    en: 'Choose video',
    es: 'Elige video',
    fi: 'Valitse video',
    fr: 'Choisissez la vidéo',
    nl: 'Kies video',
    sv: 'Välj video',
  },
  file_picker_select: {
    $i18n: true,
    da: 'Vælg fil',
    de: 'Datei wählen',
    en: 'Choose file',
    es: 'Elija el archivo',
    fi: 'Valitse tiedosto',
    fr: 'Choisir le fichier',
    nl: 'Kies bestand',
    sv: 'Välj fil',
  },
  location_picker_select: {
    $i18n: true,
    ar: 'اختيار موقع',
    da: 'Vælg placering',
    de: 'Wählen Sie einen Ort',
    en: 'Choose location',
    es: 'Elegir ubicación',
    fi: 'Valitse sijainti',
    fr: "Choisissez l'emplacement",
    nl: 'Kies locatie',
    sv: 'Välj plats',
  },
  form_submit_button: {
    $i18n: true,
    ar: 'إرسال',
    da: 'Indsend',
    de: 'Senden',
    en: 'Submit',
    es: 'Guardar',
    fi: 'Lähetä',
    fr: 'Enregistrer',
    nl: 'Verstuur',
    sv: 'Skicka in',
  },
  cancel: {
    $i18n: true,
    ar: 'إلغاء',
    da: 'Afbestille',
    de: 'Abbrechen',
    en: 'Cancel',
    es: 'Cancelar',
    fi: 'Peruuttaa',
    fr: 'Annuler',
    nl: 'Annuleren',
    sv: 'Annullera',
  },
  text_input_placeholder: {
    $i18n: true,
    ar: 'اكتب رسالة ...',
    da: 'Skriv en besked…',
    de: 'Nachricht schreiben…',
    en: 'Type a message…',
    es: 'Escriba mensaje…',
    fi: 'Kirjoita viesti…',
    fr: 'Tapez le message…',
    nl: 'Typ een bericht…',
    sv: 'Skriv ett meddelande…',
  },
  new_conversation: {
    $i18n: true,
    ar: 'محادثة جديدة',
    da: 'Ny samtale',
    de: 'Neues Gespräch',
    en: 'New conversation',
    es: 'Nueva conversacion',
    fi: 'Uusi keskustelu',
    fr: 'Nouvelle conversation',
    nl: 'Nieuw gesprek',
    sv: 'Ny konversation',
  },
  select_date: {
    $i18n: true,
    ar: 'حدد تاريخ',
    da: 'Vælg dato',
    de: 'Datum auswählen',
    en: 'Select Date',
    es: 'Seleccione fecha',
    fi: 'Valitse Päivämäärä',
    fr: 'Sélectionner une date',
    nl: 'Selecteer een datum',
    sv: 'Välj datum',
  },
  invalid_iban: {
    $i18n: true,
    ar: 'رقم الحساب المصرفي الدولي (IBAN) غير صالح',
    da: 'IBAN er ugyldigt',
    de: 'IBAN ist ungültig',
    en: 'IBAN is invalid',
    es: 'IBAN no es válido',
    fi: 'IBAN on virheellinen',
    fr: "L'IBAN est invalide",
    nl: 'IBAN is ongeldig',
    sv: 'IBAN är ogiltig',
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
