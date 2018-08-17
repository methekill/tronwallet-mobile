import { AsyncStorage } from 'react-native'
import I18n from 'react-native-i18n'
import moment from 'moment'

import { getRelativeTime } from './momentUtils'
import { USER_PREFERRED_LANGUAGE } from './constants'
import translations from './translations'

AsyncStorage.getItem(USER_PREFERRED_LANGUAGE).then(userLocale => {
  if (userLocale) {
    const locale = userLocale.substr(0, 2)
    const relativeTime = getRelativeTime(locale)
    if (locale !== 'en' && relativeTime) {
      moment.locale(locale, { relativeTime })
    }
    I18n.locale = userLocale
  }
})
I18n.missingTranslation = (obj) => `Missing this translation ${obj}`
I18n.defaultLocale = 'en-US'
I18n.fallbacks = true
I18n.translations = translations

export default I18n
