const lang = navigator.language

type Language =
  | 'ar'
  | 'az'
  | 'ca'
  | 'da'
  | 'de'
  | 'en'
  | 'es'
  | 'fi'
  | 'fr'
  | 'hi'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'lv'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sv'
  | 'tr'
  | 'uk'

type I18nMap = { [k in Language]: string } & { $i18n: true }

const LABELS: Record<string, I18nMap> = {
  image_picker_select: {
    $i18n: true,
    ar: 'اختر صورة',
    az: 'Şəkil seç',
    ca: 'Escull una imatge',
    da: 'Vælg billede',
    de: 'Bild auswählen',
    en: 'Choose image',
    es: 'Elegir imagen',
    fi: 'Valitse kuva',
    fr: "Choisissez l'image",
    hi: 'छवि चुनें',
    hu: 'Válasszon képet',
    id: 'Pilih gambar',
    it: 'Scegli immagine',
    ja: '画像を選択',
    lv: 'Izvēlieties attēlu',
    nl: 'Kies afbeelding',
    pl: 'Wybierz obraz',
    pt: 'Escolher imagem',
    ro: 'Alegeți imaginea',
    ru: 'Выберите изображение',
    sv: 'Välj bild',
    tr: 'Resmi Seçin',
    uk: 'Виберіть зображення',
  },
  image_user_picker_select: {
    $i18n: true,
    ar: 'التقط صورة ذاتية',
    az: 'Əlləşdiyinizi seç',
    ca: 'Selecciona una foto tú',
    da: 'Tag en selfie',
    de: 'Mach ein Selfie',
    en: 'Make a selfie',
    es: 'Hacer una selfie',
    fi: 'Ota selfie',
    fr: 'Prendre un selfie',
    hi: 'सेल्फी लें',
    hu: 'Készítsen önképet',
    id: 'Ambil selfie',
    it: 'Scatta un selfie',
    ja: '自撮りする',
    lv: 'Uzņemt pašportretu',
    nl: 'Maak een selfie',
    pl: 'Zrób selfie',
    pt: 'Tirar uma selfie',
    ro: 'Fă o selfie',
    ru: 'Сделать селфи',
    sv: 'Ta en selfie',
    tr: 'Özçekim yap',
    uk: 'Зробити селфі',
  },
  image_environment_picker_select: {
    $i18n: true,
    ar: 'التقط صورة',
    az: 'Şəkil seç',
    ca: 'Escull una imatge',
    da: 'Tag et billede',
    de: 'Mach ein Foto',
    en: 'Make a photo',
    es: 'Hacer una foto',
    fi: 'Ota kuva',
    fr: 'Prendre une photo',
    hi: 'फोटो लें',
    hu: 'Készítsen fényképet',
    id: 'Ambil foto',
    it: 'Scatta una foto',
    ja: '写真を撮る',
    lv: 'Uzņemt fotoattēlu',
    nl: 'Maak een foto',
    pl: 'Zrób zdjęcie',
    pt: 'Tirar uma foto',
    ro: 'Fă o fotografie',
    ru: 'Сделать фото',
    sv: 'Ta ett foto',
    tr: 'Fotoğraf çek',
    uk: 'Зробити фото',
  },
  audio_picker_select: {
    $i18n: true,
    ar: 'اختر ملف الصوت',
    az: 'Səs faylını seç',
    ca: "Escull un fitxer d'àudio",
    da: 'Vælg lydfil',
    de: 'Ton auswählen',
    en: 'Choose audio file',
    es: 'Elige el sonido',
    fi: 'Valitse äänitiedosto',
    fr: 'Choisissez le son',
    hi: 'ऑडियो फ़ाइल चुनें',
    hu: 'Válasszon hangfájlt',
    id: 'Pilih file audio',
    it: 'Scegli file audio',
    ja: '音声ファイルを選択',
    lv: 'Izvēlieties skaņas failu',
    nl: 'Kies geluidsbestand',
    pl: 'Wybierz plik dźwiękowy',
    pt: 'Escolher ficheiro de áudio',
    ro: 'Alegeți fișierul audio',
    ru: 'Выберите аудиофайл',
    sv: 'Välj ljudfil',
    tr: 'Ses Dosyasını Seçin',
    uk: 'Виберіть аудіофайл',
  },
  video_picker_select: {
    $i18n: true,
    ar: 'اختر الفيديو',
    az: 'Video seç',
    ca: 'Escull un vídeo',
    da: 'Vælg video',
    de: 'Video auswählen',
    en: 'Choose video',
    es: 'Elige video',
    fi: 'Valitse video',
    fr: 'Choisissez la vidéo',
    hi: 'वीडियो चुनें',
    hu: 'Válasszon videót',
    id: 'Pilih video',
    it: 'Scegli video',
    ja: '動画を選択',
    lv: 'Izvēlieties video',
    nl: 'Kies video',
    pl: 'Wybierz wideo',
    pt: 'Escolher vídeo',
    ro: 'Alegeți videoclipul',
    ru: 'Выберите видео',
    sv: 'Välj video',
    tr: 'Video seçin',
    uk: 'Виберіть відео',
  },
  file_picker_select: {
    $i18n: true,
    ar: 'اختر ملف',
    az: 'Fayl seç',
    ca: 'Escull un fitxer',
    da: 'Vælg fil',
    de: 'Datei wählen',
    en: 'Choose file',
    es: 'Elija el archivo',
    fi: 'Valitse tiedosto',
    fr: 'Choisir le fichier',
    hi: 'फ़ाइल चुनें',
    hu: 'Válasszon fájlt',
    id: 'Pilih file',
    it: 'Scegli file',
    ja: 'ファイルを選択',
    lv: 'Izvēlēties failu',
    nl: 'Kies bestand',
    pl: 'Wybierz plik',
    pt: 'Escolher ficheiro',
    ro: 'Alegeți fișierul',
    ru: 'Выберите файл',
    sv: 'Välj fil',
    tr: 'Dosya seçin',
    uk: 'Виберіть файл',
  },
  location_picker_select: {
    $i18n: true,
    ar: 'اختيار موقع',
    az: 'Məkan seç',
    ca: 'Escull un lloc',
    da: 'Vælg placering',
    de: 'Wählen Sie einen Ort',
    en: 'Choose location',
    es: 'Elegir ubicación',
    fi: 'Valitse sijainti',
    fr: "Choisissez l'emplacement",
    hi: 'स्थान चुनें',
    hu: 'Válasszon helyet',
    id: 'Pilih lokasi',
    it: 'Scegli posizione',
    ja: '場所を選択',
    lv: 'Izvēlieties atrašanās vietu',
    nl: 'Kies locatie',
    pl: 'Wybierz lokacje',
    pt: 'Escolher localização',
    ro: 'Alegeți locația',
    ru: 'Выберите местоположение',
    sv: 'Välj plats',
    tr: 'Konum seç',
    uk: 'Виберіть місце розташування',
  },
  form_submit_button: {
    $i18n: true,
    ar: 'إرسال',
    az: 'Göndər',
    ca: 'Enviar',
    da: 'Indsend',
    de: 'Senden',
    en: 'Submit',
    es: 'Guardar',
    fi: 'Lähetä',
    fr: 'Enregistrer',
    hi: 'जमा करें',
    hu: 'Küldés',
    id: 'Kirim',
    it: 'Invia',
    ja: '送信',
    lv: 'Iesniegt',
    nl: 'Verstuur',
    pl: 'Składać',
    pt: 'Enviar',
    ro: 'Trimite',
    ru: 'Отправить',
    sv: 'Skicka in',
    tr: 'Göndermek',
    uk: 'Подавати',
  },
  cancel: {
    $i18n: true,
    ar: 'إلغاء',
    az: 'Ləğv et',
    ca: 'Cancel·lar',
    da: 'Afbestille',
    de: 'Abbrechen',
    en: 'Cancel',
    es: 'Cancelar',
    fi: 'Peruuttaa',
    fr: 'Annuler',
    hi: 'रद्द करें',
    hu: 'Mégse',
    id: 'Batal',
    it: 'Annulla',
    ja: 'キャンセル',
    lv: 'Atcelt',
    nl: 'Annuleren',
    pl: 'Anulować',
    pt: 'Cancelar',
    ro: 'Anulare',
    ru: 'Отмена',
    sv: 'Annullera',
    tr: 'İptal etmek',
    uk: 'Скасувати',
  },
  text_input_placeholder: {
    $i18n: true,
    ar: 'اكتب رسالة ...',
    az: 'Mesaj yaz…',
    ca: 'Escriu un missatge…',
    da: 'Skriv en besked…',
    de: 'Nachricht schreiben…',
    en: 'Type a message…',
    es: 'Escriba mensaje…',
    fi: 'Kirjoita viesti…',
    fr: 'Tapez le message…',
    hi: 'संदेश लिखें…',
    hu: 'Írjon üzenetet…',
    id: 'Ketik pesan…',
    it: 'Scrivi un messaggio…',
    ja: 'メッセージを入力…',
    lv: 'Ierakstiet ziņojumu…',
    nl: 'Typ een bericht…',
    pl: 'Wpisz wiadomość…',
    pt: 'Escreva uma mensagem…',
    ro: 'Scrieți un mesaj…',
    ru: 'Введите сообщение…',
    sv: 'Skriv ett meddelande…',
    tr: 'Bir mesaj yazın…',
    uk: 'Введіть повідомлення…',
  },
  new_conversation: {
    $i18n: true,
    ar: 'محادثة جديدة',
    az: 'Yeni söhbət',
    ca: 'Nova conversació',
    da: 'Ny samtale',
    de: 'Neues Gespräch',
    en: 'New conversation',
    es: 'Nueva conversacion',
    fi: 'Uusi keskustelu',
    fr: 'Nouvelle conversation',
    hi: 'नई बातचीत',
    hu: 'Új beszélgetés',
    id: 'Percakapan baru',
    it: 'Nuova conversazione',
    ja: '新しい会話',
    lv: 'Jauna saruna',
    nl: 'Nieuw gesprek',
    pl: 'Nowa rozmowa',
    pt: 'Nova conversa',
    ro: 'Conversație nouă',
    ru: 'Новый разговор',
    sv: 'Ny konversation',
    tr: 'Yeni Sohbet',
    uk: 'Нова розмова',
  },
  select_date: {
    $i18n: true,
    ar: 'حدد تاريخ',
    az: 'Tarix seç',
    ca: 'Selecciona una data',
    da: 'Vælg dato',
    de: 'Datum auswählen',
    en: 'Select Date',
    es: 'Seleccione fecha',
    fi: 'Valitse Päivämäärä',
    fr: 'Sélectionner une date',
    hi: 'तारीख चुनें',
    hu: 'Válasszon dátumot',
    id: 'Pilih tanggal',
    it: 'Seleziona data',
    ja: '日付を選択',
    lv: 'Atlasīt datumu',
    nl: 'Selecteer een datum',
    pl: 'Wybierz datę',
    pt: 'Selecionar data',
    ro: 'Selectați data',
    ru: 'Выберите дату',
    sv: 'Välj datum',
    tr: 'Tarih seç',
    uk: 'Виберіть дату',
  },
  invalid_iban: {
    $i18n: true,
    ar: 'رقم الحساب المصرفي الدولي (IBAN) غير صالح',
    az: 'IBAN səhvdir',
    ca: 'IBAN no és vàlid',
    da: 'IBAN er ugyldigt',
    de: 'IBAN ist ungültig',
    en: 'IBAN is invalid',
    es: 'IBAN no es válido',
    fi: 'IBAN on virheellinen',
    fr: "L'IBAN est invalide",
    hi: 'IBAN अमान्य है',
    hu: 'Az IBAN érvénytelen',
    id: 'IBAN tidak valid',
    it: "L'IBAN non è valido",
    ja: 'IBANが無効です',
    lv: 'IBANs nav derīgs',
    nl: 'IBAN is ongeldig',
    pl: 'IBAN jest nieprawidłowy',
    pt: 'IBAN inválido',
    ro: 'IBAN-ul este invalid',
    ru: 'IBAN недействителен',
    sv: 'IBAN är ogiltig',
    tr: 'IBAN geçersiz',
    uk: 'Ібан недійсний',
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
  if (!_uiLocale || typeof LABELS.cancel[_uiLocale as keyof typeof LABELS.cancel] === 'undefined') {
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
