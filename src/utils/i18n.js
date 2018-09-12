import { AsyncStorage } from 'react-native'
import I18n, { getLanguages } from 'react-native-i18n'
import moment from 'moment'

import { USER_PREFERRED_LANGUAGE } from './constants'
import translations, { getRelativeTime } from './translations'

getLanguages().then(deviceLanguages => {
  AsyncStorage.getItem(USER_PREFERRED_LANGUAGE).then(preferredLanguage => {
    const userLocale = preferredLanguage || deviceLanguages[0]
    const locale = userLocale.substr(0, 2)

    if (locale !== 'en') {
      const relativeTime = getRelativeTime(locale)
      moment.locale(locale, { relativeTime })
    }
    I18n.locale = userLocale
  })
})

I18n.missingTranslation = (obj) => `Missing this translation ${obj}`
I18n.defaultLocale = 'en-US'
I18n.fallbacks = true
I18n.translations = translations

export const LANGUAGES = [
  { value: I18n.t('cancel') },
  { key: 'en-US', value: 'English' },
  { key: 'pt-BR', value: 'Português' },
  { key: 'fr-FR', value: 'Français' },
  { key: 'nl-NL', value: 'Nederlands' },
  { key: 'es-ES', value: 'Español' },
  { key: 'ch-CH', value: '中文' },
  { key: 'af', value: 'Afrikaans' },
  { key: 'ar', value: 'العربية' },
  { key: 'cs', value: 'Català' },
  { key: 'da', value: 'Dansk' },
  { key: 'de', value: 'Deutsch' },
  { key: 'el', value: 'Ελληνικά' },
  { key: 'fi', value: 'Suomi' },
  { key: 'he', value: 'עִבְרִית' },
  { key: 'hi', value: 'हिन्दी' },
  { key: 'hu', value: 'Magyar' },
  { key: 'id', value: 'Bahasa Indonesia' },
  { key: 'it', value: 'Italiano' },
  { key: 'ja', value: '日本語' },
  { key: 'ko', value: '한국어' },
  { key: 'no', value: 'Norsk' },
  { key: 'pl', value: 'Polski' },
  { key: 'ru', value: 'русский' },
  { key: 'sv', value: 'Svenska' },
  { key: 'th', value: 'ภาษาไทย' },
  { key: 'uk', value: 'українська' },
  { key: 'vi', value: 'tiếng Việt' },
  { key: 'zh', value: '漢語 汉语 中文' }
]

export default I18n
