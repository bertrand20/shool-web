import base from './translations-base'
import a from './translations-a'
import b from './translations-b'
import c from './translations-c'
import d from './translations-d'
import e from './translations-e'
import f from './translations-f'
import g from './translations-g'
import h from './translations-h'
import components from './translations-components'
import homepage from './translations-homepage'

const groups = [base, a, b, c, d, e, f, g, h, components, homepage]

const translations = { en: {}, rw: {} }
for (const group of groups) {
  Object.assign(translations.en, group.en)
  Object.assign(translations.rw, group.rw)
}

export default translations
