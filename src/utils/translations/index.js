const en = require('./en.json')
const pt = require('./pt.json')
const fr = require('./fr.json')
const nl = require('./nl.json')
const es = require('./es.json')
const ch = require('./ch.json')
const af = require('./af.json')
const ar = require('./ar.json')
const ca = require('./ca.json')
const cs = require('./cs.json')
const da = require('./da.json')
const de = require('./de.json')
const el = require('./el.json')
const fi = require('./fi.json')
const he = require('./he.json')
const hi = require('./hi.json')
const hu = require('./hu.json')
const id = require('./id.json')
const it = require('./it.json')
const ja = require('./ja.json')
const ko = require('./ko.json')
const no = require('./no.json')
const pl = require('./pl.json')
const ru = require('./ru.json')
const sv = require('./sv.json')
const th = require('./th.json')
const uk = require('./uk.json')
const vi = require('./vi.json')
const zh = require('./zh.json')

const translations = {
  en,
  pt,
  fr,
  nl,
  es,
  ch,
  af,
  ar,
  ca,
  cs,
  da,
  de,
  el,
  fi,
  he,
  hi,
  hu,
  id,
  it,
  ja,
  ko,
  no,
  pl,
  ru,
  sv,
  th,
  uk,
  vi,
  zh
}

export const getRelativeTime = (locale) =>
  translations[locale] ? translations[locale].relativeTime : translations.en.relativeTime

export default translations
