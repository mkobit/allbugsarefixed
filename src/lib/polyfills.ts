/* eslint-disable functional/immutable-data */
/* eslint-disable no-restricted-globals */
import { Temporal as TemporalImpl, Intl as IntlImpl, toTemporalInstant } from '@js-temporal/polyfill'

declare global {

  var Temporal: typeof TemporalImpl
  interface Date {
    toTemporalInstant: typeof toTemporalInstant
  }
}

globalThis.Temporal = TemporalImpl
globalThis.Intl = IntlImpl as typeof Intl
Date.prototype.toTemporalInstant = toTemporalInstant
